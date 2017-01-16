'use strict';

/**
 * Created by texpe on 12/01/2017.
 */

var router = require('express').Router();

router.use(require('./auth'));
router.use(require('./settings'));
router.use('/services', require('./services'));

module.exports = router;