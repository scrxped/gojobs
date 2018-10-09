const {diff} = require('deep-diff');
const addDays = require('date-fns/add_days');
const isFuture = require('date-fns/is_future');
const {RawJob} = require('../../models');
const fetchJob = require('./fetch-job');

async function saveJob({rgscJob}) {
  if (!rgscJob || !rgscJob.Content) {
    throw new Error('Unable to save an empty/incorrect job');
  }

  let actualRgscJob = rgscJob;

  const {
    RootContentId: jobId,
    latestVersionContentId: jobCurrId,
    latest: wasLatest,
  } = actualRgscJob.Content.Metadata;

  if (!wasLatest) {
    actualRgscJob = await fetchJob({
      jobId: jobCurrId,
    });
  }

  if (!actualRgscJob
    || !actualRgscJob.Content
    || !actualRgscJob.Content.Metadata.latest) {
    throw new Error('Unable to fetch the latest version of the job');
  }

  const {
    stats: newStats = {},
    ratings: newRatings = {},
  } = actualRgscJob.Content;

  const {ver: newVersion} = actualRgscJob.Content.Metadata;

  // Create only one date object
  const newDate = new Date();

  let newRawJob = {
    jobId,
    jobCurrId,
    job: actualRgscJob.Content,
    processed: false,
    uploaded: false,
    lastFetch: newDate,
  };

  const oldRawJob = await RawJob.findOne({jobId});

  // This block fetches the very first version (tries if needed)
  if (newVersion !== 1 && (!oldRawJob
    || (!oldRawJob.firstAddedToRgsc && !oldRawJob.firstVerNotAvail))
  ) {
    const firstVersionOfJob = await fetchJob({jobId});

    if (firstVersionOfJob) {
      const {pdate, cdate} = firstVersionOfJob.Content.Metadata;
      newRawJob.firstAddedToRgsc = pdate || cdate;
    } else {
      newRawJob.firstVerNotAvail = true;
    }
  }

  let nextFetchDays = 0;

  if (oldRawJob) {
    const oldVersion = oldRawJob.job.Metadata.ver;

    if (newVersion === oldVersion) {
      if (isFuture(oldRawJob.nextFetch)) {
        throw new Error('This job should not be fetched right now');
      }

      nextFetchDays = diff(oldRawJob.job.stats, newStats)
        ? 10
        : 20;

      newRawJob.job = {
        Metadata: oldRawJob.job.Metadata,
        stats: newStats,
        ratings: newRatings,
      };
    } else {
      const jobChanged = !!diff(
        oldRawJob.job.Metadata.data.mission,
        actualRgscJob.Content.Metadata.data.mission,
      );

      nextFetchDays = jobChanged
        ? 7
        : 14;

      newRawJob.versions = [
        ...oldRawJob.versions,
        {
          ver: newVersion,
          id: jobCurrId,
          diff: jobChanged,
        },
      ];

      newRawJob.lastNewVerFetch = newDate;
    }
  } else {
    nextFetchDays = Object.keys(newStats).length
      ? 7
      : 10;

    Object.assign(newRawJob, {
      versions: {
        ver: newVersion,
        id: jobCurrId,
        diff: true,
      },
      firstFetch: newDate,
      lastNewVerFetch: newDate,
    });
  }

  const rockstarJobCategories = ['rstar', 'verif'];

  if (rockstarJobCategories.includes(actualRgscJob.Content.Metadata.cat)) {
    nextFetchDays = 1;
  }

  newRawJob.nextFetch = addDays(new Date(), nextFetchDays);

  if (oldRawJob) {
    oldRawJob.set(newRawJob);
  }

  const result = await (oldRawJob || new RawJob(newRawJob)).save();

  return result;
}

module.exports = saveJob;