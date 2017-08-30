const config = require('../../config');
const router = require('express').Router();
const moment = require('moment');
const Paginator = require('paginator');

const mongoose = require('mongoose');
const Job = require('../../models/job');
mongoose.connect(config.mongo.connectUri, config.mongo.options);

module.exports = router;

router.use('/', (req, res, next) => {
  res.locals.partials = res.locals.partials || {};
  res.pageNumber = Math.abs(Number(req.query.page)) || 1;

  Job.find()
    .skip(config.perPage * (res.pageNumber - 1))
    .limit(config.perPage)
    .exec((err, jobs) => {
      if (err) return next('Cannot retrieve jobs from the database');

      Job.count((err, count) => {
        if (err) return next('Cannot retrieve jobs from the database');
        res.jobsCount = count;

        jobs = jobs.map(job => {
          job.updated.dateString = moment(job.updated.job).fromNow();
          return job;
        });

        res.locals.partials.jobsContext = jobs;
        next();
      });
    });
});

router.get('/', (req, res) => {
  let pagination = new Paginator(config.perPage, 1).build(
    res.jobsCount, res.pageNumber
  );
  res.render('index', {
    pagination: pagination
  });
});
