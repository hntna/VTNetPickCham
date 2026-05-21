document.addEventListener('DOMContentLoaded', () => {
  const ball = document.getElementById('minigame-ball');
  if (!ball) return;

  let isPlaying = false;
  let x = 0, y = 0, vx = 0, vy = 0;
  let ballSize = 64; 
  let rafId = null;

  ball.title = "Vuốt hoặc chạm để tung bóng!";
  ball.style.cursor = 'pointer';
  ball.style.touchAction = 'none'; // prevent screen scroll when swiping ball

  const startMinigame = (e) => {
    if (e.cancelable) e.preventDefault();
    
    if (!isPlaying) {
      isPlaying = true;
      const rect = ball.getBoundingClientRect();
      x = rect.left;
      y = rect.top;
      
      document.body.appendChild(ball);
      ball.style.position = 'fixed';
      ball.style.zIndex = '9999';
      ball.style.margin = '0';
      ball.style.width = ballSize + 'px';
      ball.style.height = ballSize + 'px';
    }

    // Give it a burst of speed
    vx = (Math.random() - 0.5) * 50; // -25 to 25
    vy = -20 - Math.random() * 20; // -20 to -40
    
    if (Math.abs(vx) < 10) vx = vx > 0 ? 15 : -15;

    ball.style.animation = 'iconSpin 0.6s linear infinite';

    if (!rafId) {
      rafId = requestAnimationFrame(updatePhysics);
    }
  };

  const updatePhysics = () => {
    // Gravity
    vy += 0.8; 
    
    // Air resistance
    vx *= 0.99; 
    vy *= 0.99;

    x += vx;
    y += vy;

    const maxX = window.innerWidth - ballSize;
    const maxY = window.innerHeight - ballSize;

    // Bounce off walls
    if (x <= 0) {
      x = 0;
      vx = Math.abs(vx) * 0.85;
    } else if (x >= maxX) {
      x = maxX;
      vx = -Math.abs(vx) * 0.85;
    }

    // Bounce off ceiling
    if (y <= 0) {
      y = 0;
      vy = Math.abs(vy) * 0.85;
    } 
    // Bounce off floor
    else if (y >= maxY) {
      y = maxY;
      vy = -Math.abs(vy) * 0.75; 
      vx *= 0.9; 
    }

    // Stop condition
    if (y >= maxY && Math.abs(vy) < 2 && Math.abs(vx) < 1) {
      y = maxY;
      vx = 0;
      vy = 0;
      rafId = null;
      ball.style.animation = 'none'; 
    } else {
      rafId = requestAnimationFrame(updatePhysics);
    }

    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
  };

  ball.addEventListener('mousedown', startMinigame);
  ball.addEventListener('touchstart', startMinigame, {passive: false});
});
