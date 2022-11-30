/**
 * @author Jeremy Glebe
 * @date 2022-10-07
 * @file This file primarily handles the creation and modification of a transformation matrix which
 *     is used by the vertex shader to change the positions of a triangle's vertices.
 */
"use strict";

/** Function which executes when the page's body is loaded */
function main() {
    sketch.init();
    // Write the vertices of the shape into the vertex shader
    sketch.writeVertices(triangle);
    // Draw the shape once
    sketch.draw(triangle);
}

/**
 * Object to encapsulate WebGL features
 */
let sketch = {
    // The canvas to which webGL draws
    canvas: null,
    // The webGL rendering context
    gl: null,
    // A vertex buffer for use with vertex placement
    vertexBuffer: null,
    // References to properties inside the webGL shader programs
    refs: {
        // Reference to the a_Position attribute in the vertex shader
        position: null,
        // Reference to a matrix which transforms vertex coordinates
        transform: null
    },
    // Shaders that will be applied to shapes when drawn
    shaders: {
        // Vertex shader program
        vertex: `#version 300 es
        in vec4 a_Position;
        uniform mat4 u_ModelMatrix;
        out vec4 v_Position;
        void main() 
        {
            gl_Position = u_ModelMatrix * a_Position;
            v_Position = gl_Position;
        }`,
        // Fragment shader program
        fragment: `#version 300 es
        #ifdef GL_ES
             precision mediump float;
        #endif
        in vec4 v_Position;
        out vec4 fragColor;
        void main() 
        {
            vec3 red = vec3(1.0, 0.0, 0.0);
            vec3 blue = vec3(0.0, 0.0, 1.0);
            // transition color from red to blue based on the z coordinate
            vec3 color = mix(red, blue, v_Position.z / 10.0);
            fragColor = vec4(color, 1.0);
        }`
    },
    /**
     * Method to initialize the Sketch
     * @return {undefined} No output
     */
    init: function () {
        // Retrieve the canvas HTML element
        this.canvas = document.querySelector('canvas');
        // Get the rendering context for WebGL
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }
        // Create a buffer object
        this.vertexBuffer = this.gl.createBuffer();
        if (!this.vertexBuffer) {
            console.log('Failed to create the buffer object');
            return;
        }
        // Initialize shaders
        if (!initShaders(this.gl, this.shaders.vertex, this.shaders.fragment)) {
            console.log('Failed to intialize shaders.');
            return;
        }
        // Get a to the a_Position attribute in the vertex shader
        this.refs.position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        if (this.refs.position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return;
        }
        // Get a reference to the storage location of u_ModelMatrix
        this.refs.transform = this.gl.getUniformLocation(this.gl.program, 'u_ModelMatrix');
        if (!this.refs.transform) {
            console.log('Failed to get the storage location of u_ModelMatrix');
            return;
        }
        // Specify the color for clearing <canvas>
        this.gl.clearColor(0, 0, 0, 1);
    },
    // Method to write the positions of vertices to a vertex shader, returns number of vertices or -1 if error
    writeVertices: function (shape) {
        // Define the vertices of the shape (triangle) in x,y coordinates
        let vertices = new Float32Array(shape.vertices);
        // Bind the buffer object to target
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        // Write date into the buffer object
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        // Assign the buffer object to a_Position variable
        this.gl.vertexAttribPointer(this.refs.position, 2, this.gl.FLOAT, false, 0, 0);
        // Enable the assignment to a_Position variable
        this.gl.enableVertexAttribArray(this.refs.position);
        // Return the number of vertices in the shape
        return shape.numVertices();
    },
    // Method to draw the loaded shape to the canvas
    draw: function (shape) {
        // Pass the transformation matrix to the vertex shader
        this.gl.uniformMatrix4fv(this.refs.transform, false, shape.transform.elements);
        // Clear <canvas>
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        // Draw the shape
        this.gl.drawArrays(this.gl.TRIANGLES, 0, shape.numVertices());
        shape.update_matrix_text();
    }
}

// Object to encapsulate shape properties
let triangle = {
    // Array of vertices in form [x1, y1, x2, y2, ...]
    vertices: [0, 0.075, -0.075, -0.075, 0.075, -0.075],
    // Matrix definining the current transformation applied to the shape
    // (Defaults to identity matrix)
    transform: new Matrix4(),
    // Method to return number of vertices
    numVertices: function () { return this.vertices.length / 2 },
    // Method to reset the transformation matrix to the identity matrix
    reset: function () {
        this.transform = new Matrix4();
        // disable the reset button
        document.getElementById("reset-button").disabled = true;
        // enable the key solution button
        document.getElementById("key-solution-button").disabled = false;
        // enable the my solution button
        document.getElementById("my-solution-button").disabled = false;
        // enable center scale button
        document.querySelector("#center-scale-button").disabled = false;
    },

    key_solution: function () {
        this.transform.elements = new Float32Array([
            2, 0, 0, 0,
            0, 3, 0, 8,
            0, 0, 5, 4,
            0, 0, 0, 1
        ]);
        // enable the reset button
        document.querySelector("#reset-button").disabled = false;
        // enable the my solution button
        document.querySelector("#my-solution-button").disabled = false;
        // disable the key solution button
        document.querySelector("#key-solution-button").disabled = true;
        // enable center scale button
        document.querySelector("#center-scale-button").disabled = false;
    },

    my_solution: function () {
        this.transform.elements = new Float32Array([
            2, 0, 0, 0,
            0, 3, 0, -8,
            0, 0, 5, -4,
            0, 0, 0, 1
        ]);
        // enable the reset button
        document.querySelector("#reset-button").disabled = false;
        // enable the key solution button
        document.querySelector("#key-solution-button").disabled = false;
        // disable the my solution button
        document.querySelector("#my-solution-button").disabled = true;
        // enable center scale button
        document.querySelector("#center-scale-button").disabled = false;
    },

    center_scale: function () {
        this.transform.elements = new Float32Array([
            2, 0, 0, 0,
            0, 3, 0, 0,
            0, 0, 5, 0,
            0, 0, 0, 1
        ]);
        // enable the reset button
        document.querySelector("#reset-button").disabled = false;
        // enable the key solution button
        document.querySelector("#key-solution-button").disabled = false;
        // enable the my solution button
        document.querySelector("#my-solution-button").disabled = false;
        // disable the center scale button
        document.querySelector("#center-scale-button").disabled = true;
    },

    update_matrix_text: function () {
        // update the text element
        document.querySelector('#matrix-text').innerHTML = "";
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                document.querySelector('#matrix-text').innerHTML += this.transform.elements[i * 4 + j] + " ";
            }
            document.querySelector('#matrix-text').innerHTML += "<br>";
        }
    }
}

function do_key_solution(){
    triangle.key_solution();
    sketch.draw(triangle);
}

function do_my_solution(){
    triangle.my_solution();
    sketch.draw(triangle);
}

function do_reset(){
    triangle.reset();
    sketch.draw(triangle);
}

function do_center_scale(){
    triangle.center_scale();
    sketch.draw(triangle);
}