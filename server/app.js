import express from 'express'
import path from 'path'

const app = express()
const __dirname = path.resolve('server')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(8080, () => {
	console.log('Server is running on http://localhost:8080')
})
