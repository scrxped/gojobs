const config = require('../../config');
const slugify = require('slug');
const palette = require('huey/palette');
const jimp = require('jimp');
const sharp = require('sharp');
const bluebird = require('bluebird');
const { pitlaneAvailability } = require('./pitlane');
const { generateStats } = require('./generate-stats');
const { getCrewDoc } = require('../crew');

bluebird.promisifyAll(jimp.prototype);

const Job = require('../../models/job');
const JobDetails = require('../../models/job-details');
const RawJob = require('../../models/raw-job');
const User = require('../../models/user');

const DEFAULT_JOB_SLUG = 'job';

module.exports = {
  processAllJobs
};

/**
 * Transforms & uploads raw jobs to the actual jobs collection.
 * @param {number} limit jobs limit
 * @param {boolean} forceUploadAll re-upload ALL the jobs.
 * WARNING: it can take a lot of time!
 * @returns {Promise<object>} structure: {amount: number, errors: number}
 */
async function processAllJobs({
  limit = 10000,
  forceUploadAll = false
}) {
  const conditions = forceUploadAll
    ? {}
    : { uploaded: false };

  const rawJobs = await RawJob
    .find(conditions)
    .limit(limit);

  const toUpload = rawJobs.length;

  console.log(`UPLOADING ${toUpload} JOBS (UPLOAD ALL = ${forceUploadAll})`);

  const uploadedJobs = await Promise.all(
    rawJobs.map(rawJob => {
      if (!rawJob.job) {
        return Promise.resolve();
      }
      return processJob({ rawJob, forceUploadAll }).catch(err => err);
    })
  );

  let uploaded = toUpload;

  uploadedJobs.forEach((job, i) => {
    if (job instanceof Error) {
      console.log(`Failed to upload job ${rawJobs[i].jobId}: ${job.message}`);
      uploaded--;
    }
    // else {
    //   console.log(`${rawJobs[i].jobId} saved`);
    // }
  });

  console.log(`UPLOADED ${uploaded}/${toUpload} JOBS`);
}

/**
 * Transforms & uploads a single rawjob.
 * @param {object} rawJob rawjob object.
 * @param {boolean} forceUploadAll forces to upload even already uploaded job
 * @returns {undefined}
 */
async function processJob({ rawJob, forceUploadAll }) {
  const { jobId, jobCurrId, uploaded } = rawJob;

  rawJob = rawJob.job;

  if (!forceUploadAll && uploaded) {
    throw new Error(`Rawjob ${jobId} already uploaded`);
  }

  let job = genBasicJobObj({ jobId, jobCurrId, rawJob });
  let jobDetails = await genExtendedJobObj({ jobId, rawJob });

  if (job) {
    const { author } = job;
    const { crewurl } = rawJob.Metadata;

    let crewDocId = '';

    // CREW
    if (crewurl) {
      const slug = crewurl.split('/')[2];
      crewDocId = (await getCrewDoc({ slug }))._id;
      jobDetails.crew = crewDocId;
    }

    // USER
    if (author) {
      let newUserDoc = { username: author };

      if (crewDocId) {
        newUserDoc.crew = crewDocId;
      }

      await User.findOneAndUpdate(
        { username: author },
        newUserDoc,
        config.mongo.standardUpdateOptions
      );
    }

    const jobDetailsOld = await JobDetails.findOne({ jobId });

    if (jobDetailsOld) {
      jobDetails = Object.assign(jobDetailsOld, jobDetails);
    }

    const uploadedJobDetailsDoc = await new JobDetails(jobDetails).save();

    job.details = uploadedJobDetailsDoc._id;

    const jobOld = await Job.findOne({ jobId });

    if (jobOld) {
      job = Object.assign(jobOld, job);
    }

    await new Job(job).save();
  } // if job

  await RawJob.findOneAndUpdate(
    { jobId },
    { uploaded: true },
    config.mongo.standardUpdateOptions
  );
}

/**
 * Generates "basic" job according to the "Job" model
 * @param {string} jobId job ID
 * @param {string} jobCurrId current job ID
 * @param {object} rawJob raw job object
 * @returns {object|undefined} generated object or undefined if the job cannot
 * be uploaded
 */
function genBasicJobObj({ jobId, jobCurrId, rawJob }) {
  const {
    name,
    ver,
    nickname,
    cat,
    originalCreatorName,
    pdate,
    cdate,
  } = rawJob.Metadata,
    imageUrl = rawJob.Metadata.thumbnail,
    maxPl = rawJob.Metadata.data.mission.gen.num,
    platformName = rawJob.Metadata.plat,
    scTypeAndModeName = getScTypeAndModeName({ rawJob }),
    scUpdated = pdate || cdate;

  const statsResult = generateStats({ rawJob });

  if (!statsResult) return;

  const { bad, stats } = statsResult;

  const slug = slugify(name).toLowerCase() || DEFAULT_JOB_SLUG;

  let job = {
    jobId,
    jobCurrId,
    name,
    slug,
    imageUrl,
    maxPl,
    scTypeAndModeName,
    stats,
    ver,
    scUpdated,
    tags: []
  };

  // 1. Check category
  if (cat === 'rstar') {
    job.rockstar = true;
  } else if (cat === 'verif') {
    job.rockstar = true;
    job.author = originalCreatorName;
  } else {
    job.author = nickname;
    job.platformName = platformName;
  }

  // 2. Add tags
  if (pitlaneAvailability(rawJob)) {
    job.tags.push('pitlane');
  }

  // 3. If this is the first version
  if (ver === 1) {
    job.scAdded = scUpdated;
  }

  // 4. If the job is "bad"
  if (bad) {
    job.bad = bad;
  }

  return job;
}

/**
 * Generates "extended" job according to the "JobDetails" model
 * @param {string} jobId job ID
 * @param {object} rawJob raw job object
 * @returns {object} generated object
 */
async function genExtendedJobObj({ jobId, rawJob }) {
  const { desc } = rawJob.Metadata,
    { tnum, racetype } = rawJob.Metadata.data.mission.gen,
    raceInfo = rawJob.Metadata.data.mission.race;

  let specific = {};

  // 1. Team number
  if (tnum > 1) {
    specific.teamNum = tnum;
  }

  // 2. Race-specific info
  if (raceInfo) {
    const { chp, lap, rdis, ivm } = raceInfo;

    // basic race info
    specific.race = {
      chp,
      dist: rdis,
      defVeh: ivm
    }

    // laps info
    if (racetype === 'Point to Point') {
      specific.race.p2p = true;
    } else {
      specific.race.laps = lap;
    }
  }

  let jobExtendedObject = {
    jobId,
    desc,
    specific
  };

  // 3. Background & foreground
  const bgFg = await getBackgroundAndForeground({ rawJob });

  if (bgFg) {
    const { background, foregroundLight } = bgFg;
    jobExtendedObject.background = background;
    jobExtendedObject.foregroundLight = foregroundLight;
  }

  return jobExtendedObject;
}

async function getBackgroundAndForeground({ rawJob }) {
  const { thumbnail } = rawJob.Metadata;

  let initialImage = null;

  try {
    initialImage = await jimp.read(thumbnail);

    const buffer = await initialImage.getBufferAsync(jimp.AUTO);

    const imagePng = await sharp(buffer).png().toBuffer();

    const image = await jimp.read(imagePng);

    let pixels = [];

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, i) => {
      pixels.push(
        image.bitmap.data[i + 0],
        image.bitmap.data[i + 1],
        image.bitmap.data[i + 2],
        image.bitmap.data[i + 3],
      );
    });

    let fgLightPoints = 0;
    // let firstColorDark = true;

    const background = palette(pixels, 3)
      .map((color, i) => {
        if (isForegroundLight(color)) {
          // if (i === 0) {
          //   firstColorDark = false;
          // }
          fgLightPoints++;
        }
        return `${color[0]},${color[1]},${color[2]}`;
      });

    let foregroundLight = fgLightPoints >= 1;

    // If first color in the gradient is dark, and either second
    // or third is light, let the foreground be light anyway
    // if (!foregroundLight && firstColorDark) {
    //   foregroundLight = true;
    // }

    return {
      background,
      foregroundLight
    };
  } catch {}
}

function isForegroundLight(rgb) {
  const R = rgb[0],
    G = rgb[1],
    B = rgb[2];

  const perceivedLuminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;

  return perceivedLuminance < 128;
}

function getScTypeAndModeName({ rawJob }) {
  const { type, mode } = rawJob.Metadata.data.mission.gen,
    { name } = rawJob.Metadata;

  let scTypeName = type,
    scModeName = mode;

  if (type === 'FreeMission') {
    if (mode === 'Last Team Standing') {
      scTypeName = 'Last Team Standing';
    } else if (mode === 'Capture') {
      scTypeName = 'Capture';

      const captureMode = name.split(' - ')[0];
      if (captureMode === 'Raid'
        || captureMode === 'Contend'
        || captureMode === 'GTA'
        || captureMode === 'Hold') {
        scModeName = `Capture: ${captureMode}`;
      }
    } else {
      scTypeName = 'Mission';
    }
  } else if (type === 'Survival') {
    scTypeName = 'Mission';
    scModeName = 'Survival';
  }

  return {
    scTypeName,
    scModeName
  };
}