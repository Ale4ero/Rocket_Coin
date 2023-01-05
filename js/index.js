const canvas = document.querySelector('canvas')
const levelVal = document.querySelector('#levelVal')
const c = canvas.getContext('2d')


canvas.width = innerWidth
canvas.height = innerHeight

let level = 1
let highScore = 1
let startTime = Date.now()
let player = new Player()
let projectiles = []
let asteroids = []
let particles = []
let astCount = 4
let hit = false
let music = true
//prescreen appears so that user inputs into browser and music can start
let preScreen = true
let game = {
    over: false,
    active: true
}

//list of songs
var songs = [
    './audio/Yolo_TheStrokes.mp3',
    './audio/Everlong_FooFighters.mp3',
    './audio/HardToExplain_TheStrokes.mp3',
    './audio/RoomOnFire_TheStrokes.mp3'
]

//function that initializes game
function init(){

    level = 1
    startTime = Date.now()
    player = new Player()
    projectiles = []
    asteroids = []
    particles = []
    hit = false
    game = {
        over: false,
        active: true
    }
    levelVal.innerHTML = level
    //background stars
    for(let i = 0; i < 1000; i++) {
        let amount = Math.random() * 10;
        particles.push(new Particle({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            }, 
            velocity: {
                x: -0.5,
                y : 0
            },
            size: {
                width: amount,
                height: amount
            },
            color : '#9CD2EC',
            fade: false,
            star: true,
            type: Math.random() * 3,    //randomise, if > 2 its a big star
            opacity: 0.7

        }))
    }

    //show level
    document.querySelector('#showLevel').innerHTML = 'LEVEL: '+ level
        document.querySelector('#showLevel').style.display = 'block'
        setTimeout(()=>{
            document.querySelector('#showLevel').style.display = 'none'
        },2000)
}


//function to handle input from keyboard
function handleKeyInput(event) {
    if (game.over) return
    const { key, type, shiftKey} = event
    const isKeyDown = type === 'keydown' ? true : false

    
    if (key === 'a' || key === 'A'){
        player.rotatingLeft = isKeyDown
    } 
    if (key === 'd' || key === 'D'){
        player.rotatingRight = isKeyDown
    } 
    if (key === 'w' || key === 'W'){
        player.engineOn = isKeyDown
    } 
    if (key === ' '){
        player.shooting = isKeyDown
        //console.log(projectiles)
    } 
    if (key === 's' || key === 'S'){
        player.reverse = isKeyDown
    }
    if (key === 'Shift'){
        player.boost = isKeyDown
    }
}



//function to create particles
function createParticles({object, color, fade, opacity, star, type }){
    for(let i = 0; i < 15; i++){
        let amount = Math.random() * 10
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width/2,
                y: object.position.y + object.height/2
            }, 
            velocity: {
                x: (Math.random() - .5) * 2,
                y : (Math.random() - .5) * 2
            },
            size: {
                width: amount,
                height: amount
            },
            color : color || '#8e99a9',
            fade: true,
            star: false,
            type: 0,
            opacity: 1
        }))
    }
}

//consistent frame rate, 60fps
let fps = 60
let fpsInterval = 1000 / fps

let msPrev = window.performance.now()



//main animation function
function animate(){
    if (!game.active) return
    
    requestAnimationFrame(animate)

    //make sure code runs 60 fps no matter what system, since requestAnimation function varies per system
    const  msNow = window.performance.now()
    const elapsed = msNow - msPrev
    if (elapsed < fpsInterval) return
    msPrev = msNow - (elapsed % fpsInterval)



    //continue to next level every 20s
    //use date.now to tell how much time has gone by
    const nowTime = Date.now()
    const elapTime = nowTime - startTime
    console.log('Time: '+elapTime+'ms')
    //if 20 seconds have elapsed, next level
    if (elapTime > 20000){
        level++
        levelVal.innerHTML = level
        startTime = Date.now()

        document.querySelector('#showLevel').innerHTML = 'LEVEL: '+ level
        document.querySelector('#showLevel').style.display = 'block'
        setTimeout(()=>{
            document.querySelector('#showLevel').style.display = 'none'
        },2000)
    }


    document.querySelector('#showSeconds').innerHTML = Math.floor(21 - (elapTime/1000)) + 's'

    // c.fillStyle = '#24162F'
    c.fillStyle = '#2c0c52'
    
    c.fillRect(0, 0, canvas.width, canvas.height)
    



    //when stars go off screen draw new ones 
    particles.forEach((particle, i) =>{
        if (particle.position.x + particle.size.width < 0){
            particle.position.x = canvas.width + particle.size.width
            particle.position.y = Math.random() * canvas.height
        }

        //when opacity is gone remove stars otherwise update the stars
        if (particle.opacity <= 0){
            setTimeout(()=>{
                particles.splice(i, 1)
            }, 0) 
        } else{
            particle.update()
        }  
    })
    

    //garbage collecting for projectiles
    projectiles.forEach((projectile, index)=> {
        if (projectile.position.y + projectile.radius < 0){
            projectiles.splice(index, 1)
        }else if (projectile.position.y > canvas.height){
            projectiles.splice(index, 1)
        }else if (projectile.position.x + projectile.radius < 0){
            projectiles.splice(index, 1)
        }else if (projectile.position.x > canvas.width){
            projectiles.splice(index, 1)
        }
        else{
            projectile.update()
        }
    })  
    
    
    
    //garbage collecting for asteroids
    asteroids.forEach((asteroid, i)=>{
        if (asteroid.image){
            //variables for asteroid borders
            const ARBorder = asteroid.position.x + asteroid.width
            const ALBorder = asteroid.position.x
            const ABBorder = asteroid.position.y + asteroid.height
            const ATBorder = asteroid.position.y

            //variables for player borders
            const PRBorder = player.position.x + player.width
            const PLBorder = player.position.x
            const PBBorder = player.position.y + player.height
            const PTBorder = player.position.y

            //if asteroid goes off screen delete it
            if(ALBorder > canvas.width || ATBorder > canvas.height){
                setTimeout(()=>{
                    asteroids.splice(i,1)
                }, 0) 
            }else{
                asteroid.update()
            }
            
            //player collision with asteroids
            if (ARBorder >= PLBorder && ALBorder <= PRBorder &&
                ABBorder >= PTBorder && ATBorder <= PBBorder){
                    if(player.boost && player.engineOn){
                        createParticles({object: asteroid, color: '#8e99a9', fade : true})
                        setTimeout(() =>{
                            console.log('ram hit!')
                            asteroids.splice(i,1)
                        }, 0)
                    }else{
                        // console.log('player hit!')
                        // console.log('you lose!')
                        
                        player.opacity = 0
                        game.over = true
                        createParticles({object: player, color: 'red', fade: true})
                        if (level > highScore) highScore = level;
                        
                        //ensure game only detects colllision once instead of multiple times in loop
                        if (!hit){
                            //play sounds
                            audio.bombSound.play()
                            audio.gameOver.play()

                            //set game not active and display restart screen after 2 seconds
                            setTimeout(()=>{
                                console.log("player hit game over!")
                                game.active = false
                                document.querySelector('#restartScreen').style.display = 'flex'
                                document.querySelector('.currentScoreEl').innerHTML = level
                                document.querySelector('.highScoreEl').innerHTML = highScore
                            }, 2000)

                            hit = true

                        }  
                    }          
            }
    
            //collision detection for projectiles and ateroids, projectile hits asteroid
            projectiles.forEach((projectile, j) =>{
                if(projectile.position.x <= ARBorder && 
                    projectile.position.x  >= ALBorder && 
                    projectile.position.y  >= ATBorder && 
                    projectile.position.y  <= ABBorder){

                        createParticles({object: asteroid, color: '#8e99a9', fade : true})
                        setTimeout(() =>{
                            //console.log('hit!')
                            audio.bombSound.play()
                            asteroids.splice(i,1)
                            projectiles.splice(j, 1)
                        }, 0)
                    }

            })
        }

    })


    //min number of asteroids
    if (asteroids.length < level + astCount){
        //console.log(asteroids)
        asteroids.push(new Asteroid())
    }

    //as long as game is not over mover player
    if (!game.over){
        player.movePlayer()
    }

}//END OF ANIMATE


document.addEventListener('keydown', handleKeyInput);
document.addEventListener('keyup', handleKeyInput);





//if prescreen is on and key is pressed display start screen
document.body.addEventListener('keydown',(e)=>{
    if (preScreen){
        document.querySelector('#preScreen').style.display = 'none'
        document.querySelector('#startScreen').style.display = 'block'
        preScreen = false
        //can now start playlist and sound affects
        playlist(Math.floor(Math.random() * songs.length), songs)
    }
})



document.querySelector('#startButton').addEventListener('click',()=>{
    document.querySelector('#startScreen').style.display = 'none'
    init()
    animate()
    audio.pressedSound.play()
})

document.querySelector('#restartButton').addEventListener('click',()=>{
    game.active = true
    init()
    animate()
    audio.pressedSound.play()
    document.querySelector('#restartScreen').style.display = 'none'
})
document.querySelector('#rsHomeButton').addEventListener('click',()=>{
    document.querySelector('#startScreen').style.display = 'block'
    document.querySelector('#restartScreen').style.display = 'none'
    document.querySelector('.optionsScreen').style.display = 'none'
    audio.pressedSound.play()
})

document.querySelector('#opHomeButton').addEventListener('click',()=>{
    document.querySelector('#startScreen').style.display = 'block'
    document.querySelector('#restartScreen').style.display = 'none'
    document.querySelector('.optionsScreen').style.display = 'none'
    document.querySelector('#optionsScreen').style.display = 'none'
    audio.pressedSound.play()
})

document.querySelector('#optionsButton').addEventListener('click',()=>{
    document.querySelector('#startScreen').style.display = 'none'
    document.querySelector('.optionsScreen').style.display = 'flex'
    document.querySelector('#optionsScreen').style.display = 'flex'
    document.querySelector('#optionsScreen').style.backgroundColor = '#004162'
    document.querySelector('#opHomeButton').style.display = 'block'
    document.querySelector('#opBackButton').style.display = 'none'
    audio.pressedSound.play()
})

document.querySelector('#rsOptionsButton').addEventListener('click',()=>{
    document.querySelector('#startScreen').style.display = 'none'
    document.querySelector('.optionsScreen').style.display = 'flex'
    document.querySelector('#optionsScreen').style.backgroundColor = '#00416200'
    document.querySelector('#optionsScreen').style.display = 'flex'
    document.querySelector('#restartScreen').style.display = 'none'
    document.querySelector('#opHomeButton').style.display = 'none'
    document.querySelector('#opBackButton').style.display = 'block'
    audio.pressedSound.play()
})

document.querySelector('#opBackButton').addEventListener('click',()=>{
    document.querySelector('.optionsScreen').style.display = 'none'
    document.querySelector('#optionsScreen').style.display = 'none'
    document.querySelector('#restartScreen').style.display = 'flex'
    audio.pressedSound.play()
})

document.querySelector('.musicOn').addEventListener('change',(event)=>{
    if(event.currentTarget.checked){
        bgMusic.mute(false)
        music = true
    }else{
        console.log("music paused")
        bgMusic.mute(true)
        music = false
    }
})

document.querySelector('.soundFxOn').addEventListener('change',(event)=>{
    if(event.currentTarget.checked){
        muteSoundFx(false)
    }else{
        console.log("sound fx muted")
        muteSoundFx(true)
    }
})


document.querySelector('#restartButton').addEventListener('mouseover',()=>{
    audio.selectSound.play()
})
document.querySelector('#optionsButton').addEventListener('mouseover',()=>{
    audio.selectSound.play()
})
document.querySelector('#garageButton').addEventListener('mouseover',()=>{
    audio.selectSound.play()
})
document.querySelector('#startButton').addEventListener('mouseover',()=>{
    audio.selectSound.play()
})
document.querySelector('#opHomeButton').addEventListener('mouseover',()=>{
    audio.selectSound.play()
})
document.querySelector('#opBackButton').addEventListener('mouseover',()=>{
    audio.selectSound.play()
})
document.querySelector('#rsHomeButton').addEventListener('mouseover',()=>{
    audio.selectSound.play()
})
document.querySelector('#rsOptionsButton').addEventListener('mouseover',()=>{
    audio.selectSound.play()
})








