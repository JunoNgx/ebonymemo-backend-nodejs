const express = require("express")
const router = express.Router()

const DevController = require('../controllers/devs')

// mainly for the admin panel
router.get('/',
    DevController.getAll
)

router.get('/:devId',
    DevController.checkExists,
    DevController.getOne
)

router.post("/",
    DevController.checkNotExists,
    DevController.create
)

router.patch("/:devId",
    DevController.checkExists,
    DevController.checkNewId,
    DevController.update
)

router.delete("/:devId",
    DevController.checkExists,
    DevController.delete
)

module.exports = router