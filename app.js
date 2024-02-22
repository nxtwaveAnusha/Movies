const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null
const intializeDBAndSever = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
intializeDBAndSever()
const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
     SELECT movie_name FROM movie;`

  const moviesArray = await db.all(getMoviesQuery)
  response.send(moviesArray.map(each => convertDbObjectToResponseObject(each)))
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  const addMovieQuery = `
    INSERT INTO movie (director_id,movie_Name,lead_actor) 
    VALUES (${directorId},'${movieName}','${leadActor}');`

  await db.run(addMovieQuery)

  response.send('Movie Successfully Added')
})
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`

  const movie = await db.get(getMovieQuery)
  response.send(convertDbObjectToResponseObject(movie))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body

  const {directorId, movieName, leadActor} = movieDetails

  const updatemovieQuery = `UPDATE movie SET director_id= ${directorId}, movie_name='${movieName}',lead_actor='${leadActor}' WHERE movie_id = ${movieId};`
  await db.run(updatemovieQuery)
  response.send('Movie Details Updated')
})
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deletemovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`

  await db.run(deletemovieQuery)
  response.send('Movie Removed')
})
app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
     SELECT * FROM director;`

  const directorArray = await db.all(getDirectorQuery)
  response.send(
    directorArray.map(each => convertDbObjectToResponseObject(each)),
  )
})
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorName} = request.params
  const getMovQuery = `
     SELECT movie.movie_name FROM movie INNER JOIN director ON movie.director_id = director.director_id WHERE director.director_name = '${directorName}';`

  const movArray = await db.all(getMovQuery)
  response.send(movArray.map(para => convertDbObjectToResponseObject(para)))
})
module.exports = app
