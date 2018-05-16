const jimp = require('jimp');
const palette = require('huey/palette');
const sharp = require('sharp');
const bluebird = require('bluebird');

bluebird.promisifyAll(jimp.prototype);

module.exports = {
  secCheckpointsExist,
  secondaryVehicles,
  isNameBad,
  getScTypeAndModeId,
  pitlaneAvailability,
  getBackground
};

function secCheckpointsExist(sndchk) {
  for (let i = 0; i < sndchk.length; i++) {
    const { x, y } = sndchk[i];
    if (x !== 0 || y !== 0) {
      return true;
    }
  }

  return false;
}

function secondaryVehicles(raceInfo) {
  const { cptfrm, cptfrms, trfmvm } = raceInfo;

  const checkpointsTransformVehicles = [
    ...cptfrm,
    ...cptfrms
  ];

  let vehicles = [];

  checkpointsTransformVehicles.forEach(index => {
    if (index < 0) return;

    const vehicleId = trfmvm[index];

    // Means "Base vehicle"
    if (vehicleId === 0) return;

    const alreadyExist = vehicles.some(vehCurrId => vehCurrId === vehicleId);

    if (alreadyExist) return;

    vehicles.push(vehicleId);
  });

  return vehicles;
}

/**
 * Checks if a name of the job starts with non-english letters.
 * @param {object} rgscJob rgsc job object
 * @returns {boolean} true if it does
 */
function isNameBad({ rgscJob }) {
  const name = rgscJob.Metadata.name;
  return name[0].match(/([^\w]|_)/);
}

function getScTypeAndModeId({ rgscJob }) {
  let { type, mode } = rgscJob.Metadata.data.mission.gen;

  let scTypeName = type;
  let scModeName = mode;

  if (type === 'FreeMission') {
    if (mode === 'Last Team Standing' || mode === 'Capture') {
      scTypeName = mode;
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

/**
 * Checks if pitlane is available in the current race.
 * Make sure that a "job" is a race.
 * @param {object} rgscJob RGSC job object
 * @returns {boolean} is there a pitlane
 */
function pitlaneAvailability({ rgscJob }) {
  const WRENCH_NAME = 'Vehicle - Health',
    WRENCH_MAX_DISTANCE = 40,
    WRENCHES_MIN_NEXT_TO_EACH_OTHER_FOR_PITLANE = 4,
    WRENCHES_NEAR_ANOTHER = WRENCHES_MIN_NEXT_TO_EACH_OTHER_FOR_PITLANE - 1;

  const { type, loc } = rgscJob.Metadata.data.mission.weap;

  let wrenchesNumber = 0;

  type.forEach((weapon, i) => {
    if (weapon !== WRENCH_NAME) return;

    let wrenchesNear = 0;

    loc.forEach((location, j) => {
      if (j === i || type[j] !== WRENCH_NAME) {
        return;
      }

      if (distanceBetweenPoints(loc[i], location) <= WRENCH_MAX_DISTANCE) {
        wrenchesNear++;
      }
    });

    if (wrenchesNear >= WRENCHES_NEAR_ANOTHER) {
      wrenchesNumber++;
    }
  });

  return wrenchesNumber >= WRENCHES_MIN_NEXT_TO_EACH_OTHER_FOR_PITLANE;
}

async function getBackground({ rgscJob }) {
  const { thumbnail } = rgscJob.Metadata;

  try {
    const initialImage = await jimp.read(thumbnail);

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

    const background = palette(pixels, 3)
      .map(color => color.join(','));

    return background;
  } catch {}
}

/**
 * Returns distance between two points on the Cartesian plane
 * @param {object} p1 point 1
 * @param {object} p2 point 2
 * @returns {float} distance between the points
 */
function distanceBetweenPoints(p1, p2) {
  const distance = Math.sqrt(
    (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
  );

  return distance;
}