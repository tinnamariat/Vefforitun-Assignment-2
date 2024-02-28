// variables
const synth = new Tone.Synth().toDestination();
let tunes = []
let recording = false
let recordedTunes = []
let isKeydown = false
let musicPlaying = false


// plays the notes that are pressed if there is no music playing and adds to the backend if it is recording
function handlePressedTune(tune)  {
    //initialise a timer to decide when to play individual notes
    console.log('Playing tune:', tune);

    if (musicPlaying === false) {
        const now = Tone.now();
        synth.triggerAttackRelease(tune, '8n', now);
    }
    if (recording === true){ // if it is recording the tunes will be added to the backend
        recordedTunes.push({ note: tune, duration: '8n', timing: recordedTunes.length / 2 })
    }
}

// witch note should be played on which key
const soundMap = {
    'a' : 'c4',
    'w' : 'c#4',
    's' : 'd4',
    'e' : 'd#4',
    'd' : 'e4',
    'f' : 'f4',
    't' : 'f#4',
    'g' : 'g4',
    'y' : 'g#4',
    'h' : 'a4',
    'u' : 'bb4',
    'j' : 'b4',
    'k' : 'c5',
    'o' : 'c#5',
    'l' : 'd5',
    'p' : 'd#5',
    ';' : 'e5'
}

window.onload = function () {
    // Tune name input
    document.getElementById('recordName').addEventListener('keydown', (e) => {
        e.stopPropagation() // enable all other functions
    })

    // Piano buttons
    document.querySelectorAll('#keyboardDiv button').forEach(button => {
        button.addEventListener('click', function() {
            handlePressedTune(this.id);
        });
    });

    // Play button
    document.getElementById('tunebtn').addEventListener('click', () => {
        musicPlaying = true
        const now = Tone.now();
        const selectedOption = document.getElementById('tunesDrop').value
        const selectedSong = tunes.find((element) => element.id === selectedOption)
        const selectedTune = selectedSong.tune
        selectedTune.forEach((element) => {
            synth.triggerAttackRelease(element.note, element.duration, element.timing + now);
        })
        document.getElementById('tunebtn').setAttribute('disabled', 'disabled') // disabling the play button
        setTimeout(() => {
            document.getElementById('tunebtn').removeAttribute('disabled') // turning the play button back on
            musicPlaying = false
        }, selectedTune.at(-1).timing * 1000) // time were the play button and keys should be disabled
    })

    // Recorde button
    document.getElementById('recordbtn').addEventListener('click', () => {
        recording = true
        document.getElementById('recordbtn').setAttribute('disabled', 'disabled') // disable the recorde button
        document.getElementById('stopbtn').removeAttribute('disabled') // enable the stop button
    })

    // Stop button
    document.getElementById('stopbtn').addEventListener('click', () => {
        recording = false
        document.getElementById('stopbtn').setAttribute('disabled', 'disabled') // disable the stop button
        document.getElementById('recordbtn').removeAttribute('disabled') // enable the record button

        let name = document.getElementById('recordName').value
        // if the is no name entered
        if (name === '') {
            name = 'No-name Tune';
        }
        const data = {name, tune: recordedTunes}
        // adding the new recording to the backend
        fetch('http://localhost:3000/api/v1/tunes', {body: JSON.stringify(data), method: 'POST', headers: {
                'Content-Type': 'application/json'
            }})
            .then(() => {
                fetchTunes()
                document.getElementById('recordName').value = ''
                recordedTunes = [] // clearing the tunes that where recorded
            })
    })

    // making sure there is just one note played each time the user presses a key
    document.addEventListener('keyup', function() {
        isKeydown = false
    })

    document.addEventListener('keydown', function(event) {
        if(isKeydown) {
            return
        }

        const keyPressed = event.key.toLowerCase();
        isKeydown = true
        if (soundMap[keyPressed]) {
            const soundFile = soundMap[keyPressed];
            handlePressedTune(soundFile);
        }
    })

    // Tunes drop
    // getting the names of the tunes from the backend and displaying them in the dropdown
    const fetchTunes = () => {
        const tuneDrop = document.getElementById('tunesDrop');
        tuneDrop.innerHTML = ''
        // Fetch tunes from backend
        fetch('http://localhost:3000/api/v1/tunes')
            .then(response => response.json())
            .then(data => {
                tunes = data
                data.forEach(tune => {
                    // Create an option element for each tune
                    const option = document.createElement('option'); // create <option></option>
                    option.value = tune.id; // <option value="tune.id"></option>
                    option.text = tune.name; // <option value="tune.id">tune.name</option>
                    tuneDrop.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching tunes:', error));
    }

    fetchTunes()
};

