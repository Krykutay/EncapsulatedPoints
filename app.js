var camera, scene, renderer;
var geometry;
var material1 = new THREE.LineBasicMaterial( { color: 0xffffff } );
var material2 = new THREE.LineBasicMaterial( { color: 0xff0000 } );
var material3 = new THREE.LineBasicMaterial( { color: 0x008000 } );
var points = [];
var newpoints = [];
var lines = [];
var diagonals = [];
var angleDeg = [];
var laststep = false;


var vec = new THREE.Vector3(); 
var pos = new THREE.Vector3(); 

init();
animate();


function init()
{
mouse = new THREE.Vector3(0, 0, 0);
renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener('keydown', onDocumentKeyDown, false);
window.addEventListener( 'resize', onWindowResize, false );

camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.z = 100;

scene = new THREE.Scene();
}



function onDocumentMouseDown( event ) {

    event.preventDefault();
    
    switch ( event.which ) {
        case 1: // left mouse click

        vec.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            - ( event.clientY / window.innerHeight ) * 2 + 1,
            0.5 );
        
        vec.unproject( camera );
        
        vec.sub( camera.position ).normalize();
        
        var distance = - camera.position.z / vec.z;
        
        pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );
        if (!laststep)
            DrawLines(pos);
        else{
            var farp = new THREE.Vector2(pos.x, pos.y+999);
            var i;
            var cross_count = 0;
            for (i = 0; i<newpoints.length-1; i++){
                if (doIntersect(newpoints[i], newpoints[i+1], pos, farp)){
                    cross_count++;
                }
            }
            if (cross_count % 2 == 0)
                DrawPoints(pos, material3);
            else
                DrawPoints(pos, material2);

        }
            

        break;

    }
  
}

function onDocumentKeyDown( event ){
    event.preventDefault();

    switch ( event.which ) {
        case 49: // if 1 is pressed
        if (points.length > 2)
            DrawLines(points[0]);
        break;

        case 51: // if 3 is pressed
        if (newpoints.length > 2)
            DrawLastPol();
        break;

        case 52: // if 4 is pressed
        laststep = true;
        break;


        case 50: // if 2 is pressed
        points.pop();

        if (points.length > 4)
        //

        var min_index;
        var min_vertex = 9999999.99;
        var i;
        for (i = 0; i < points.length; i++){
            if (points[i].x < min_vertex){
                min_vertex = points[i].x;
                min_index = i;
            }
        }
        var i;
        for (i = 0; i < points.length; i++){
            if(i == min_index)
                continue;
            if(min_vertex == points[i].x){
                if (points[i].y < points[min_index]){
                    min_index = i;
                }
            }
        }

        var prev_hull;
        var next_hull;
        prev_hull = (min_index-1) % points.length;
        if (prev_hull == -1)
            prev_hull = prev_hull + points.length;
        next_hull = (min_index+1) % points.length;

    
    var det;
    det = (points[min_index].x - points[prev_hull].x) * (points[next_hull].y - points[prev_hull].y) - (points[next_hull].x - points[prev_hull].x) * (points[min_index].y - points[prev_hull].y);

    points_poly = [];
    var i, prev, next, poly;
    if (det < 0){  //clockwise
        for (i = 0; i<points.length; i++){
            prev = (i-1) % (points.length);
            if (prev == -1)
                prev = prev + points.length;
            next = (i+1) % (points.length);

            var det1;
            det1 = (points[i].x - points[prev].x) * (points[next].y - points[prev].y) - (points[next].x - points[prev].x) * (points[i].y - points[prev].y);


            if (det1 < 0)
                poly = 0; //convex
            else if(det1 > 0)
                poly = 1; //concave
            else
                poly = 2; //collinear

            points_poly.push(poly);
        }
    }

    if (det > 0){  //counterclockwise
        for (i = 0; i<points.length; i++){
            prev = (i-1) % (points.length);
            if (prev == -1)
                prev = prev + points.length;
            next = (i+1) % (points.length);

            var det2;
            det2 = (points[i].x - points[prev].x) * (points[next].y - points[prev].y) - (points[next].x - points[prev].x) * (points[i].y - points[prev].y);

            if (det2 < 0)
                poly = 1; //concave
            else if(det2 > 0)
                poly = 0; //convex
            else
                poly = 2; //collinear
            
            points_poly.push(poly);
        }
    }


    var diagonaldict = {};
    var i;
    for(i = 0; i<points.length; i++){
        prev = (i-1) % (points.length);
        if (prev == -1)
            prev = prev + points.length;
        next = (i+1) % (points.length); 

        var diagonalarray = [];
        var j;

        if(i == 0){
            diagonalarray.push(points.length-1);
        }
        else{
            diagonalarray.push(i-1);
        }

        diagonalarray.push((i+1) % points.length);
            
        for(j = 0; j<points.length; j++){
            if (j == i || j == prev || j == next)
                continue;
            
            if (points_poly[i] == 0){
                var diagonal = false;

                if (det < 0)
                    diagonal = isLeft(points[i], points[j], points[next]) && !(isLeft(points[i], points[j], points[prev]));
                if (det > 0)
                    diagonal = isLeft(points[i], points[j], points[prev]) && !(isLeft(points[i], points[j], points[next]));

                if (!diagonal)
                    diagonalarray.push(j);

            }
            else if (points_poly[i] == 1){
                var diagonal = false;
                if (det < 0)
                    diagonal = isLeft(points[i], points[j], points[prev]) && !(isLeft(points[i], points[j], points[next]));
                if (det > 0)
                    diagonal = isLeft(points[i], points[j], points[next]) && !(isLeft(points[i], points[j], points[prev]));

                if (diagonal)
                    diagonalarray.push(j);

            }

        }

        

        diagonaldict[i] = diagonalarray;

    }

        console.log("normal ones: ", diagonaldict);

        // Check if diagonals hit an edge
        var badDiagonals = {}; // diagonals that cut an edge

        for (i = 0; i < points.length; i++){
            var j;
            var temparray = [];
            for (j = 0; j < diagonaldict[i].length; j++){
                var p1, p2, q1, q2;
                p1 = points[i];
                var q1_pre = points[diagonaldict[i][j]];

                var q1;
                newLine = extendLine(p1.x, p1.y, points[diagonaldict[i][j]].x, points[diagonaldict[i][j]].y, 1000);
                q1 = new THREE.Vector2(newLine[0], newLine[1]);

                var k;
                for (k = 0; k < points.length; k++){

                    if(k == i || (k+1) % points.length == i || k % points.length == diagonaldict[i][j] || (k+1) % points.length == diagonaldict[i][j])
                        continue;

                    p2 = points[k % points.length];
                    q2 = points[(k+1) % points.length];

                    if (doIntersect(p1, q1, p2, q2)){
                        temparray.push(diagonaldict[i][j]);
                        break;
                    }
                }
                
            }
            badDiagonals[i] = temparray;
            
        }


        for (i = 0; i<points.length; i++){
            var j;
            for (j = 0; j < badDiagonals[i].length; j++){
                var index = diagonaldict[i].indexOf(badDiagonals[i][j]);
                diagonaldict[i].splice(index, 1);
            }
        }

        var turnpoints = [];
        for (i = 0; i<points.length; i++){

            if (diagonaldict[i].length > 0 && diagonaldict[(i+1) % points.length].length == 0){
                if(!turnpoints.includes(i))
                    turnpoints.push(i);
            }
            
            else if (diagonaldict[i].length == 0 && diagonaldict[(i+1) % points.length].length > 0){
                if(!turnpoints.includes((i+1) % points.length))
                    turnpoints.push((i+1) % points.length);
            }
        }

        console.log("turnpoints: ", turnpoints);

        var fixcross = [];

        for (i = 0; i<turnpoints.length; i++){
            fixcross[i] = [];

            if (det > 0 && points_poly[turnpoints[i]] == 1){
                continue;
            }
            else if(det < 0 && points_poly[turnpoints[i]] == 1){
                continue;
            }
            
            var j;
            for(j = 0; j<diagonaldict[turnpoints[i]].length; j++){
                //  points[diagonaldict[turnpoints[i]][j]]      safe location
                //  points[turnpoints[i]]                       turn point
                //  determine 3rd point

                var newp;
                newLine = extendLine(points[diagonaldict[turnpoints[i]][j]].x, points[diagonaldict[turnpoints[i]][j]].y, points[turnpoints[i]].x,points[turnpoints[i]].y, 1000);
                newp = new THREE.Vector2(newLine[0], newLine[1]);

                
                var list1 = [];
                var list2 = [];

                var k;
                for (k = 0; k<points.length; k++){
                    if(k == turnpoints[i] || (k+1) % points.length == turnpoints[i] || 
                        k % points.length == diagonaldict[turnpoints[i]][j] || (k+1) % points.length == diagonaldict[turnpoints[i]][j])
                    continue;

                    p2 = points[k % points.length];
                    q2 = points[(k+1) % points.length];

                    
                    if (doIntersect(points[turnpoints[i]], newp, p2, q2)){

                        list1.push(k % points.length)
                        list1.push((k+1) % points.length);
                        var templist = intersect(points[turnpoints[i]].x, points[turnpoints[i]].y, newp.x, newp.y, p2.x, p2.y, q2.x, q2.y);
                        list2.push(templist[0]);
                        list2.push(templist[1]);

                    }
                }


                var min = 9999;
                var num;
                for(k = 0; k<list1.length; k += 2){
                    
                    var diff = Math.sqrt(Math.pow(points[turnpoints[i]].x - list2[k], 2) + Math.pow(points[turnpoints[i]].y - list2[k+1], 2));
                    if (diff < min){
                        min = diff;
                        num = k;
                    }

                }

                //  points[list1[num]]           start from this
                //  list2[num], list2[num+1]    end here
                //  scale by 0.01

                var newp_left;
                newLeftLine = extendLine(points[list1[num]].x, points[list1[num]].y, list2[num], list2[num+1], 0.01);
                newp_left = new THREE.Vector2(newLeftLine[0], newLeftLine[1]);

                var new_turnleft;
                newTurnLineleft = extendLine(newp_left.x, newp_left.y, points[turnpoints[i]].x, points[turnpoints[i]].y, 1000);
                new_turnleft = new THREE.Vector2(newTurnLineleft[0], newTurnLineleft[1]);


                //  points[list1[num+1]]         start from this
                //  list2[num], list2[num+1]    end here
                //  scale by 0.01
                
                var newp_right;
                newRightLine = extendLine(points[list1[num+1]].x, points[list1[num+1]].y, list2[num], list2[num+1], 0.01);
                newp_right = new THREE.Vector2(newRightLine[0], newRightLine[1]);

                var new_turnright;
                newTurnLineright = extendLine(newp_right.x, newp_right.y, points[turnpoints[i]].x, points[turnpoints[i]].y, 1000);
                new_turnright = new THREE.Vector2(newTurnLineright[0], newTurnLineright[1]);


                var firstlc = 0, firstrc = 0;
                for (k = 0; k<points.length; k++){
                    if (k == list1[num] || k == diagonaldict[turnpoints[i]][j] || k == (diagonaldict[turnpoints[i]][j] - 1+points.length) %points.length){
                        continue;
                    }


                    if (doIntersect(points[k], points[(k+1)%points.length], newp_left, points[diagonaldict[turnpoints[i]][j]])){
                        firstlc++;
                    }

                    if (doIntersect(points[k], points[(k+1)%points.length], newp_right, points[diagonaldict[turnpoints[i]][j]])){
                        firstrc++;
                    }
                }

                var secondlc = 0, secondrc = 0;
                for (k = 0; k<points.length; k++){
                    if (k == list1[num] || k == diagonaldict[turnpoints[i]][(j+1)%2] || k == (diagonaldict[turnpoints[i]][(j+1)%2] - 1+points.length) %points.length){
                        continue;
                    }

                    if (doIntersect(points[k], points[(k+1)%points.length], newp_left, points[diagonaldict[turnpoints[i]][(j+1)%2]]) ){
                        //(doIntersect(points[k], points[(k+1)%points.length], newp_left, new_turnleft && k != turnpoints[i] && (k+1)%points.length != turnpoints[i] ))){

                        var check = false;
                        var a = points[diagonaldict[turnpoints[i]][j]];
                        var b = points[diagonaldict[turnpoints[i]][(j+1)%2]];
                        var c = new THREE.Vector2((a.x - b.x)/50, (a.y - b.y)/50);
                        var m;
                        for (m = 0; m<50; m++){
                            var d = new THREE.Vector2( b.x + c.x * m, b.y + c.y * m );

                            if (!doIntersect(points[k], points[(k+1)%points.length], newp_left, d)){
                                check = true;
                            }
                            
                        }

                        if(!check)
                            secondlc++;
                    }

                    if (doIntersect(points[k], points[(k+1)%points.length], newp_right, points[diagonaldict[turnpoints[i]][(j+1)%2]]) ){
                        //(doIntersect(points[k], points[(k+1)%points.length], newp_right, new_turnright && k != turnpoints[i] && (k+1)%points.length != turnpoints[i] ))){
                        

                        var check = false;
                        var a = points[diagonaldict[turnpoints[i]][j]];
                        var b = points[diagonaldict[turnpoints[i]][(j+1)%2]];
                        var c = new THREE.Vector2((a.x - b.x)/50, (a.y - b.y)/50);
                        var m;
                        for (m = 0; m<50; m++){
                            var d = new THREE.Vector2( b.x + c.x * m, b.y + c.y * m );

                            if (!doIntersect(points[k], points[(k+1)%points.length], newp_right, d)){
                                check = true;
                            }
                            
                        }

                        if(!check)
                            secondrc++;
                    }
                }

                console.log("BUG FINDING ", turnpoints[i]);
                console.log(firstlc, firstrc, secondlc, secondrc);

                if (firstlc == 0 && secondrc != 0){
                    fixcross[i].push(list1[num]);
                    fixcross[i].push(list1[num+1]);
                    fixcross[i].push(list2[num]);
                    fixcross[i].push(list2[num+1]);

                
                    console.log("THIS IS THE POINT : ", list2[num], list2[num+1]);
                    lines.push(new THREE.Vector2( points[turnpoints[i]].x, points[turnpoints[i]].y ));
                    lines.push(new THREE.Vector2( list2[num], list2[num+1] ));
                    DrawLine();
                    lines = [];

                    if (list1[num] > turnpoints[i]){
                        for (k = turnpoints[i]+1; k<list1[num]; k++){
                            newpoints[k].x = 0;
                        }
                        newpoints[list1[num]].x = list2[num];
                        newpoints[list1[num]].y = list2[num+1];
                    }
                    else if (turnpoints[i] > list1[num]){
                        for (k = list1[num+1]+1; k<turnpoints[i]; k++){
                            newpoints[k].x = 0;
                        }
                        newpoints[list1[num+1]].x = list2[num];
                        newpoints[list1[num+1]].y = list2[num+1];
                    }
                    
                  
                }
                else if (firstrc == 0 && secondlc != 0){

                    fixcross[i].push(list1[num]);
                    fixcross[i].push(list1[num+1]);
                    fixcross[i].push(list2[num]);
                    fixcross[i].push(list2[num+1]);

                   
                    console.log("THIS IS THE POINT : ", list2[num], list2[num+1]);
                    lines.push(new THREE.Vector2( points[turnpoints[i]].x, points[turnpoints[i]].y ));
                    lines.push(new THREE.Vector2( list2[num], list2[num+1] ));
                    DrawLine();
                    lines = [];

                    if (list1[num] > turnpoints[i]){
                        for (k = turnpoints[i]+1; k<list1[num]; k++){
                            newpoints[k].x = 0;
                        }
                        newpoints[list1[num]].x = list2[num];
                        newpoints[list1[num]].y = list2[num+1];
                    }
                    else if (turnpoints[i] > list1[num]){
                        for (k = list1[num+1]+1; k<turnpoints[i]; k++){
                            newpoints[k].x = 0;
                        }
                        newpoints[list1[num+1]].x = list2[num];
                        newpoints[list1[num+1]].y = list2[num+1];
                    }

                
                }



            }
        }

        
        /*
        for (i=0; i<fixcross.length;i++){
            if (det > 0 && points_poly[turnpoints[i]] == 1){
                continue;
            }
            else if(det < 0 && points_poly[turnpoints[i]] == 1){
                continue;
            }
            var c = 0;
            for(j=0; j<fixcross[i].length; j+=4){
                var k,l;
                var crossing = false;
                var p1 = new THREE.Vector2( fixcross[i][j+2], fixcross[i][j+3] );
                for (k=0; k<fixcross.length; k++){
                    if (i == k){
                        continue;
                    }
                    if (det > 0 && points_poly[turnpoints[k]] == 1){
                        continue;
                    }
                    else if(det < 0 && points_poly[turnpoints[k]] == 1){
                        continue;
                    }
                    for(l=0; l<fixcross[k].length; l+=4){
                        var p2 = new THREE.Vector2( fixcross[k][l+2], fixcross[k][l+3] );
                        if(doIntersect(points[turnpoints[i]], p1, points[turnpoints[k]], p2)){
                            crossing = true;
                            break;
                        }
                    }
                    if (crossing)
                        break;
                }

                if (!crossing || crossing){
                    c++;
                    console.log("j is ", j, "turn point is", turnpoints[i]);
                    lines.push(new THREE.Vector2( points[turnpoints[i]].x, points[turnpoints[i]].y ));
                    lines.push(new THREE.Vector2( p1.x, p1.y ));
                    DrawLine();
                    lines = [];


                    if (fixcross[i][j] > turnpoints[i]){
                        for( k = turnpoints[i]+1; k<fixcross[i][j]; k++){
                            newpoints[k].x = 0;
                        }
                        newpoints[fixcross[i][j]].x = fixcross[i][j+2];
                        newpoints[fixcross[i][j]].y = fixcross[i][j+3];
                    }
                    else if (turnpoints[i] > fixcross[i][j]){
                        for (k = fixcross[i][j+1]+1; k<turnpoints[i]; k++){
                            newpoints[k].x = 0;
                        }
                        newpoints[fixcross[i][j+1]].x = fixcross[i][j+2];
                        newpoints[fixcross[i][j+1]].y = fixcross[i][j+3];
                    }



                }
            }
        } */


        newpoints = removeElementsWithValue(newpoints, 0);

        break;
    }
}

function removeElementsWithValue(arr, val) {
    var i = arr.length;
    while (i--) {
        if (arr[i].x == val) {
            arr.splice(i, 1);
        }
    }
    return arr;
}


// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

    // Check if none of the lines are of length 0
      if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
          return false
      }
  
      denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  
    // Lines are parallel
      if (denominator === 0) {
          return false
      }
  
      let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
      let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  
    // is the intersection along the segments
      if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
          return false
      }
  
    // Return a object with the x and y coordinates of the intersection
      let x = x1 + ua * (x2 - x1)
      let y = y1 + ua * (y2 - y1)
  
      return [x, y]
}

function isBetween(a, b, c){
    var EPSILON = 1.0 / 1048576.0;
    var crossproduct = (c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y);
    if (Math.abs(crossproduct) > EPSILON){
        return false;
    }

    var dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y)*(b.y - a.y);
    if (dotproduct < 0){
        return false;
    } 

    var squaredlengthba = (b.x - a.x)*(b.x - a.x) + (b.y - a.y)*(b.y - a.y);
    if (dotproduct > squaredlengthba){
        return false;
    }

    return true;
           
}


function extendLine(x1,y1,x2,y2, length){
    var lenAB, x, y;
    lenAB = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

    x = x2 + (x2 - x1) / lenAB * length;
    y = y2 + (y2 - y1) / lenAB * length;

    return [x, y];

}

function isLeft(a, b, c){
    var area = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
    if (area > 0)
        return true;
    else
        return false;
}

function onSegment(p, q, r){
    if ((q.x <= Math.max(p.x, r.x)) && (q.x >= Math.min(p.x, r.x)) && (q.y <= Math.max(p.y, r.y)) && (q.y >= Math.min(p.y, r.y)))
        return true;

    return false;
}

function orientationOfLines(p, q, r){

    var val = ((q.y - p.y) * (r.x - q.x)) - ((q.x - p.x) * (r.y - q.y));
    if (val > 0)
        return 1  //clockwise
    else if (val < 0)
        return 2  //counterclockwise
    else
        return 0  //colinear
}

function doIntersect(p1,q1,p2,q2){
      
    var o1 = orientationOfLines(p1, q1, p2) 
    var o2 = orientationOfLines(p1, q1, q2) 
    var o3 = orientationOfLines(p2, q2, p1) 
    var o4 = orientationOfLines(p2, q2, q1) 
  
    if ((o1 != o2) && (o3 != o4))
        return true
  
    // Special Cases 
  
    // p1 , q1 and p2 are colinear and p2 lies on segment p1q1 
    if ((o1 == 0) && onSegment(p1, p2, q1))
        return true
  
    // p1 , q1 and q2 are colinear and q2 lies on segment p1q1 
    if ((o2 == 0) && onSegment(p1, q2, q1))
        return true
  
    // p2 , q2 and p1 are colinear and p1 lies on segment p2q2 
    if ((o3 == 0) && onSegment(p2, p1, q2))
        return true
  
    // p2 , q2 and q1 are colinear and q1 lies on segment p2q2 
    if ((o4 == 0) && onSegment(p2, q1, q2))
        return true
  
    // If none of the cases 
    return false

}
function DrawLines(coord){
    points.push( new THREE.Vector2( coord.x, coord.y ));
    newpoints.push( new THREE.Vector2( coord.x, coord.y ));

    geometry = new THREE.BufferGeometry().setFromPoints( points );

    var line = new THREE.Line( geometry, material1 );

    scene.add( line );
}

function DrawLine(){

    geometry = new THREE.BufferGeometry().setFromPoints( lines );

    var line = new THREE.Line( geometry, material2 );

    scene.add( line );


}

function DrawLastPol(){

    geometry = new THREE.BufferGeometry().setFromPoints( newpoints );

    var line = new THREE.Line( geometry, material2 );

    scene.add( line );
}

function DrawPoints(coord, material){
    geometry = new THREE.CircleGeometry( 0.5, 32 );
	var circle = new THREE.Mesh( geometry, material ); 
	circle.position.x = coord.x;
	circle.position.y = coord.y;

    scene.add( circle );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize( window.innerWidth, window.innerHeight );
  
  }


function animate() {

    requestAnimationFrame( animate );
    renderer.render( scene, camera );

}

