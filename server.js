import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/taraFavouritBooks"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const Author = mongoose.model('Author', {
  name: String
})

const Book = mongoose.model('Book', {
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  }
})

if (process.env.RESET_DATABASE) {
  console.log('reading is fun')
  const seedDatabase = async () => {
    await Author.deleteMany()
    const johnGrisham = new Author({ name: 'John Grisham' })
    await johnGrisham.save()
  
    const sydneySheldon = new Author({ name: 'Sydney Sheldon' })
    await sydneySheldon.save()
    
    await Book.deleteMany()

    await new Book({ title: 'A time to kill', author: johnGrisham }).save()
    await new Book({ title: 'The Firm', author: johnGrisham }).save()
    await new Book({ title: 'The Guardians', author: johnGrisham }).save()
    await new Book({ title: 'The Innocent Man', author: johnGrisham }).save()
    await new Book({ title: 'If tomorrow comes', author: sydneySheldon }).save()
    await new Book({ title: 'Master of the Game', author: sydneySheldon }).save()
    await new Book({ title: 'The other side of midnight', author: sydneySheldon }).save()
    await new Book({ title: 'Tell me your dream', author: sydneySheldon }).save()
  }
  seedDatabase()
}

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
  if(mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: 'Service unavailable' })
  }
})

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Hello world')
})

app.get('/authors', async (req, res) => {
  const authors = await Author.find()
  res.json(authors)
})

app.get('/authors/:id', async (req, res) => {
  const author = await Author.findById(req.params.id)
  if(author) {
    res.json(author)
  } else {
    res.status(404).json({ error: 'Author not found'})
  }
})

app.get('/authors/:id/books', async (req, res) => {
  const author = await Author.findById(req.params.id)
  if(author) {
    const books = await Book.find({ author: mongoose.Types.ObjectId(author.id)})
    res.json(books)
  } else {
    res.status(404).json({ error: 'Author not found'})
  }
})
app.get('/books', async (req, res) => {
  const books = await Book.find().populate('author')
  res.json(books)
})
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
