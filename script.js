const canvas  = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;
const x = canvas.width/2;
const y = canvas.height/2;

const score = document.getElementById("score");
let currentScore = 0;
const startButton = document.getElementById("startGameButton");
const modalElement = document.getElementById("modal"); 
const finalScore = document.getElementById("finalScore");

class Player {
    constructor(x,y,radius,color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

}

class Projectile {
    constructor(x,y,radius,color,velocity,velocityMultiple){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.velocityMultiple = velocityMultiple;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x = this.x +  this.velocity.x*this.velocityMultiple;
        this.y = this.y + this.velocity.y*this.velocityMultiple;

    }

}


class Enemy {
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x = this.x +  this.velocity.x;
        this.y = this.y + this.velocity.y;

    }

}


class Particle {
    constructor(x,y,radius,color,velocity,decay,velocityMultiple){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.decay = decay;
        this.velocityMultiple = velocityMultiple;
    }

    draw(){
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update(){
        this.draw();
        this.x = this.x +  this.velocity.x * this.velocityMultiple;
        this.y = this.y + this.velocity.y * this.velocityMultiple;
        this.alpha -= this.decay ;
    }

}

let player  = new Player(x,y,20,"white");
player.draw();

let projectiles = [];
let enemies = [];
let particles = [];

function init(){
    player  = new Player(x,y,20,"white");
    projectiles = [];
    enemies = [];
    particles = [];
    currentScore =0 ;
    score.innerHTML = currentScore;
}


function spawnEnemies(){
    setInterval(()=>{
        const radius = Math.random()*25+5;
        let xpos ;
        let ypos ;
        const heuValue = Math.random()*360;
        const color = `hsl(${heuValue},50%,50%)`;
        if(Math.random() < 0.5){
             xpos = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
             ypos = Math.random()*canvas.height ;
        }else{
            xpos = Math.random()*canvas.width ;
            ypos = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;   
        }
        const p = ypos- y;
        const b = xpos - x;
        const angle = Math.atan2(p,b);
        const velocity = { x:-1*Math.cos(angle), y:-1*Math.sin(angle)}
      
       enemies.push(new Enemy(xpos,ypos,radius,color,velocity));
    },1000);
}

let animationId;

function animate(){
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0,0,0,0.1'
    ctx.fillRect(0,0,canvas.width,canvas.height);
    player.draw()
   
    particles.forEach((particle,index)=>{
        if(particle.alpha <= 0){
            setTimeout(()=>{
                particles.splice(index,1);
            },0)
           
        }else{
            particle.update()
        }
        

    })

    projectiles.forEach((projectile,index)=>{

      projectile.update();
       //clear projectile when out of frame
      if(projectile.x < 0 || projectile.x > canvas.width ||
           projectile.y < 0 || projectile.y > canvas.height){
          setTimeout(()=>{
                projectiles.splice(index,1);
            },[0])
           }
    })


    enemies.forEach((enemy,enemyIndex)=>{
        
           //end game 
           const distance = Math.hypot(enemy.x -player.x,enemy.y-player.y);
           if(distance - enemy.radius - player.radius < 0){
            finalScore.innerHTML = currentScore;
             cancelAnimationFrame(animationId);
             modalElement.style.display = 'flex';

           }

        enemy.update();

        //enemy and projectile collision
        projectiles.forEach((projectile,projectileIndex)=>{
            const distance = Math.hypot(enemy.x - projectile.x,enemy.y-projectile.y);
            if(distance - enemy.radius - projectile.radius < 0){

                for(let i = 0;i<enemy.radius*2 ;i++){
                    particles.push(new Particle(projectile.x,projectile.y,
                        Math.random()*3+1,enemy.color,{
                        x: Math.random()-0.5,
                        y: Math.random() - 0.5
                    },0.02*Math.random()+0.01 , Math.random()*4))
                }

                if(enemy.radius - 10 > 10){
                    currentScore += 100;
                    score.innerHTML = currentScore;
                    gsap.to(enemy,{
                        radius: enemy.radius - 10
                    })
                    projectiles.splice(projectileIndex,1);

                }else{
                    currentScore += 150;
                    score.innerHTML = currentScore;
                    setTimeout(()=>{
                        enemies.splice(enemyIndex,1);
                        projectiles.splice(projectileIndex,1);
                    },[0])
                }
                
                
            }
        })
    })

}

addEventListener('mousedown',(e)=>{
    const p = (e.clientY - y);
    const b = (e.clientX - x);
    const angle = Math.atan2(p,b);

    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
  
    const projectile  =  new Projectile(x,y,5,"white",velocity,5);
    projectiles.push(projectile)
})


startButton.addEventListener('click',()=>{
    modalElement.style.display = 'none';
    init();
    animate();
    spawnEnemies();
})