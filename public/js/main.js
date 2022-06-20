$(document).ready(function() {
    $('#title').autocomplete({
        source: async function(req, res) {
            let data = await fetch(`http://localhost:8000/search?query=${req.term}`)
                            .then(results => results.json())
                            .then(results => results.map(result => {
                                return {
                                    label: result.title,
                                    value: result.title,
                                    id: result._id
                                }
                            }))
                            res(data)
            // let result = await data.json()
            // result = result.map()
        },
        minLength: 2,
        select: function(event, ui) {
            console.log(ui.item.id) // We want to pass in the id of the movie and not the name to prevent duplicates being confused
            fetch(`http://localhost:8000/get/${ui.item.id}`)
                .then(result => result.json())
                .then(result => {
                    $('#cast').empty()
                    result.cast.forEach(cast => $('#cast').append(`<li>${cast}</li>`))
                    $('img').attr('src', result.poster)
                })
        }
    })
})