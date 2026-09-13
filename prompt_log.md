USER:  First upgrade: Cars going both ways down the road, if the chicken crosses paths with it or is on the road as a car hits it, it has to restart
CHAT:  You could add multiple car objects with different speeds and directions, update their positions continuously with a game loop, and use collision detection to check whether the chicken overlaps with a car. I also suggest resetting the chicken’s position and score whenever a collision happens, while keeping the rest of your existing HTML the same.

USER: Second upgrade, make the chicken more detailed 
    (I wanted to see how specifically detailed Chat can get down to)

CHAT: Yep — easiest way is to upgrade the drawPlayer() part so the chicken looks more like an actual chicken instead of just a square.

USER: Third Upgrade: move the road down so that there is only one space between the chicken and the road, make the three lane road a two lane road

CHAT: For this upgrade, change the road from 3 lanes to 2 lanes and move it closer to the chicken.

Since the chicken starts at y: 525 and moves in 50px tiles, putting the road from y = 400 to y = 500 leaves exactly one grass tile between the chicken and the road.

USER: Fourth Upgrade: after the first two lanes, leave a grass gap, then make one lane road, and then another grass gap and then a two lane road 

CHAT: Yep — for Upgrade 4, we can stack the roads like this from the chicken moving upward:

Chicken start
↓
Grass
2-lane road
Grass gap
1-lane road
Grass gap
2-lane road
Grass

USER: What does getelementbyID do?

CHAT: It means: find the HTML element whose id is "score".

For example, in your HTML you have:

<div id="score">Score: 0</div>

Then this JavaScript:

document.getElementById("score")

finds that <div>.

USER: 

CHAT: 

USER: 

CHAT: 

USER: 

CHAT: 

USER: 

CHAT: 

USER: 

CHAT: 