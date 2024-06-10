const fs = require('fs')
const express = require('express')
const app = express()
const { formidable } = require('formidable')

const port = process.env.PORT || 3000



app.get('/', (req, res) => {
    res.sendFile('index.html', {root: "./html"})
})

app.post('/upload', (req, res, next) => {
    const form = formidable()

    form.parse(req, (err, fields, files) => {
        if(err) {
            next(err)
            return
        }

        let filePath = files["filename"][0]["filepath"]

        const timelineJSON = fs.readFileSync(filePath, 'utf8')
        const timelines = JSON.parse(timelineJSON)

        let oldCoordinates = [fields["x1"], fields["y1"], fields["z1"]]
        let newCoordinates = [fields["x2"], fields["y2"], fields["z2"]]

        const keyframes = timelines[""][1].keyframes

        for(k in keyframes) {
            let cameraPosition = keyframes[k].properties["camera:position"]
            let subtractX = cameraPosition[0] - oldCoordinates[0]
            let subtractY = cameraPosition[1] - oldCoordinates[1]
            let subtractZ = cameraPosition[2] - oldCoordinates[2]

            let newX = subtractX + newCoordinates[0]
            let newY = subtractY + newCoordinates[1]
            let newZ = subtractZ + newCoordinates[2]

            const xyzNew = [newX, newY, newZ]

            keyframes[k].properties["camera:position"] = xyzNew
        }
        fs.unlink(filePath, (err) => {
            if(err) {
                console.log("Unsuccessful removification xd: " + err)
                return
            }
            console.log("Successfully removed file: " + filePath)
        })

        res.json(timelines)
    })
})

app.listen(port, () => {
    console.log(`Server started at port ${port}`)
})






