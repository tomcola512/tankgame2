export const Game = () => {
    return <>
    Wow what a cool game!
    </>;
}

export default Game;

// const setup = () => {
//     const canvas = document.createElement('canvas');
//     document.body.appendChild(canvas);
//     const ctx = canvas.getContext('2d');

//     const start = +(new Date());
//     const blit = () => {
//         const now = +(new Date());
//         const T = (now - start) / 1000;
        
//         ctx.fillStyle = 'rgb(0,0,0)';
//         ctx.fillRect(0, 0, canvas.width, canvas.height);

//         const X = canvas.width / 2 + 25 * Math.sin(T);
//         const Y = canvas.height / 2 + 25 * Math.cos(T);

//         console.log(X + ", " + Y);

//         ctx.beginPath();
//         ctx.fillStyle = 'rgb(255, 0, 0)';
//         ctx.arc(X, Y, 25, 0, Math.PI * 2, true);
//         ctx.fill();
//         requestAnimationFrame(blit);
//     }
//     requestAnimationFrame(blit);
// }; setup();