/**
 * Min Lee
 * Jami Montgomery
 * COSC-275 Computer Graphics
 */
/**
 *
 */
// Main function
// Runs in Browser

var angleRate = 45.0;
var s1 = 1.0;
var s2 = 1.0;
var s3 = 1.0;
var s4 = 1.0;

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    /* Shaders are the GPU processors
     *  Vertex Shader processes vertices
     *
     *  Fragment Shader processes texels (pixels), determine color
     */
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    // Write the positions of vertices to a vertex shader
    /*
     * Create Vertex Data and store it on the graphics card GPU
     */
    var n = initCubeBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the cube vertices');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0.5, 1, 1);

    // Get the storage locations of u_ModelMatrix, u_ViewMatrix, and u_ProjMatrix
    var u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');
    if (!u_mvpMatrix) {
        console.log('Failed to Get the storage locations of u_mvpMatrix');
        return;
    }

    //initialize model, view, and projection matrices
    //combined view and projection as one matrix from the beginning
    //mvp will be the final one that houses all three to be sent down to the vertex shader (for efficiency)
    var modelMatrix = new Matrix4(); // The model matrix
    var vpMatrix = new Matrix4(); //The view * projection matrix
    var mvpMatrix = new Matrix4();    // Model view projection matrix

    //Setting perspective and camera view
    vpMatrix.setPerspective(40, 1, 1, 100);
    vpMatrix.lookAt(0, 1, 7, 0, 0, 0, 0, 1, 0);

    // Current rotation angle
    var currentAngle = 45.0;

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //Depth testing
    gl.enable(gl.DEPTH_TEST);

    // Start drawing
    var tick = function() {
        // Update the rotation angle
        currentAngle = animate(currentAngle);

        //LEFT VIEWPORT --------------------------------------------------------
        gl.viewport( 0, 0, gl.drawingBufferWidth/2, gl.drawingBufferHeight);
        //Rotate, translating and scaling model matrix to apply to first cube
        modelMatrix.setRotate(currentAngle, 0, 1, 0);
        modelMatrix.translate(0, 1, 0);
        modelMatrix.scale((1*s1), (0.5*s1), (1*s1));
        mvpMatrix.set(vpMatrix).multiply(modelMatrix);
        //sending mvpMatrix down
        gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);

        gl.clear(gl.COLOR_BUFFER_BIT);

        //drawing cube
        gl.drawArrays(gl.TRIANGLES, 0, n);

        //initializing buffer for pyramid
        var m = initPyramidBuffers(gl);
        //Rotate, translating and scaling model matrix to apply to pyramid
        modelMatrix.setRotate(currentAngle, 0, 1, 0);
        modelMatrix.translate(0, 0, 0);
        modelMatrix.scale((1.5*s2), (1*s2), (1.5*s2));
        mvpMatrix.set(vpMatrix).multiply(modelMatrix);
        //sending mvpMatrix down
        gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
        //drawing pyramid
        gl.drawArrays(gl.TRIANGLES, 0, m);

        //reinitializing cube buffers so that the other draw functions draw that and not a pyramid
        initCubeBuffers(gl);

        //TOP RIGHT VIEWPORT --------------------------------------------------------
        gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
        //Rotate, translating and scaling model matrix to apply to second cube
        modelMatrix.setRotate(currentAngle, 1, 0, 0);
        modelMatrix.scale((2.5*s3), (2.5*s3), (2.5*s3));
        mvpMatrix.set(vpMatrix).multiply(modelMatrix);
        //sending mvpMatrix down
        gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
        //drawing second cube
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        //BOTTOM RIGHT VIEWPORT --------------------------------------------------------
        gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2);
        // Set the rotation matrix
        modelMatrix.setRotate(currentAngle, 0, 1, 0);
        modelMatrix.scale(s4, s4, s4);
        modelMatrix.translate(1.5, 0, 0);
        mvpMatrix.set(vpMatrix).multiply(modelMatrix);
        //sending mvpMatrix down
        gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
        //drawing last cube
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        requestAnimationFrame(tick, canvas);
    };
    tick();

}

function initCubeBuffers(gl) {

    var cubeVertices = new Float32Array([
        //Front face
        0.5,  0.5,  0.5,
        -0.5,  0.5,  0.5,
        -0.5, -0.5,  0.5,

        -0.5, -0.5,  0.5,
        0.5, -0.5,  0.5,
        0.5,  0.5,  0.5,

        //Top face
        0.5,  0.5,  0.5,
        0.5,  0.5, -0.5,
        -0.5,  0.5, -0.5,

        -0.5,  0.5, -0.5,
        -0.5,  0.5,  0.5,
        0.5,  0.5,  0.5,

        //Right face
        0.5,  0.5,  0.5,
        0.5,  0.5, -0.5,
        0.5, -0.5, -0.5,

        0.5, -0.5, -0.5,
        0.5, -0.5,  0.5,
        0.5,  0.5,  0.5,

        //Left face
        -0.5,  0.5,  0.5,
        -0.5,  0.5, -0.5,
        -0.5, -0.5, -0.5,

        -0.5, -0.5, -0.5,
        -0.5, -0.5,  0.5,
        -0.5,  0.5,  0.5,

        //Bottom face
        0.5,  -0.5,  0.5,
        0.5,  -0.5, -0.5,
        -0.5,  -0.5, -0.5,

        -0.5, -0.5, -0.5,
        -0.5,  -0.5,  0.5,
        0.5,  -0.5,  0.5,

        //Back face
        0.5,  0.5,  -0.5,
        -0.5,  0.5,  -0.5,
        -0.5, -0.5,  -0.5,

        -0.5, -0.5,  -0.5,
        0.5, -0.5,  -0.5,
        0.5,  0.5,  -0.5,

    ]);

    var n = 36; // The number of vertices

    // Create a buffer object
    var cubeVertexBuffer = gl.createBuffer();
    if (!cubeVertexBuffer) {
        console.log('Failed to create the buffer object for vertices');
        return -1;
    }

    // Bind the vertex buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    var cubeColors = new Float32Array([
        //Front face
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        //Back face
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        //Top face
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        //Bottom face
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        //Right face
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        //Left face
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0

    ]);

    var cubeColorBuffer = gl.createBuffer();
    if (!cubeColorBuffer) {
        console.log('Failed to create the buffer object for color');
        return -1;
    }

    // Bind the color buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }

    // Assign the buffer object to a_Color variable
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Color variable
    gl.enableVertexAttribArray(a_Color);

    return n;
}

function initPyramidBuffers(gl) {

    var pyramidVertices = new Float32Array([

        //Pyramid Vertices

        //Front Face
        -0.5, -0.5, 0.5,
        0.0, 0.5, 0.0,
        0.5, -0.5, 0.5,

        //Right Face
        0.5, -0.5, 0.5,
        0.0, 0.5, 0.0,
        0.5, -0.5, -0.5,

        //Back Face
        0.5, -0.5, -0.5,
        0.0, 0.5, 0.0,
        -0.5, -0.5, -0.5,

        //Left Face
        -0.5, -0.5, -0.5,
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.5,

        //Bottom Face
        -0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,

        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5

    ]);

    var m = 18; // The number of vertices

    // Create a buffer object
    var pyramidVertexBuffer = gl.createBuffer();
    if (!pyramidVertexBuffer) {
        console.log('Failed to create the buffer object for vertices');
        return -1;
    }

    // Bind the vertex buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, pyramidVertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    var pyramidColors = new Float32Array([

        //Pyramid Colors

        //Front face
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,

        //Right face
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,

        //Back face
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,

        //Left face
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,

        //Bottom face
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0

    ]);

    var pyramidColorBuffer = gl.createBuffer();
    if (!pyramidColorBuffer) {
        console.log('Failed to create the buffer object for color');
        return -1;
    }

    // Bind the color buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidColorBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, pyramidColors, gl.STATIC_DRAW);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }

    // Assign the buffer object to a_Color variable
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Color variable
    gl.enableVertexAttribArray(a_Color);

    return m;
}


// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (angleRate * elapsed) / 1000.0;
    return newAngle %= 360;
}

function speedUp() {
    angleRate += 10;
}//speed up

function slowDown() {
    angleRate -= 10;
}//slow down

function changeDirection() {
    angleRate = -angleRate;
}//change direction

function changeSize1plus() {
    s1 += 0.1;
}//change size for top left cube

function changeSize2plus() {
    s2 += 0.1;
}//change size for pyramid

function changeSize3plus() {
    s3 += 0.1;
}//change size for top right cube

function changeSize4plus() {
    s4 += 0.1;
}//change size for bottom right cube

function changeSize1minus() {
    s1 -= 0.1;
}//change size for top left cube

function changeSize2minus() {
    s2 -= 0.1;
}//change size for pyramid

function changeSize3minus() {
    s3 -= 0.1;
}//change size for top right cube

function changeSize4minus() {
    s4 -= 0.1;
}//change size for bottom right cube

// Shaders
// Vertex and Fragment
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_mvpMatrix;\n' +
  'varying lowp vec4 vColors;\n' +
  'void main() {\n' +
  '  vColors = a_Color;\n' +
  '  gl_Position = u_mvpMatrix * a_Position;\n' +
'}\n';

// Fragment shader program
//
var FSHADER_SOURCE =
  'varying lowp vec4 vColors;\n' +
  'precision mediump float;\n' +
  'void main() {\n' +
  '  gl_FragColor = vColors;\n' +
  '}\n';
