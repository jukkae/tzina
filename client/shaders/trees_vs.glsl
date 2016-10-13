// frequencies for rustling animation
// can be tweaked to taste
#define SIDE_TO_SIDE_FREQ1 1.975
#define SIDE_TO_SIDE_FREQ2 0.793
#define UP_AND_DOWN_FREQ1 0.375
#define UP_AND_DOWN_FREQ2 0.193

varying vec3 vColor;

// uniforms
// common uniforms
uniform float time; // increase by delta time in render loop
uniform float speedFactor; // larger value -> faster bending and rustling
uniform float pointSize; // rendering point size

// bending uniforms
uniform float bendFactor; // amount of bending
uniform float bendHeightLimit; // the height above which the bending starts
uniform vec2 wind; // direction & speed of the wind on the xz plane - note: only affects bending

// rustling uniforms
uniform float rustleHeightLimit; // the height above which the rustling starts
uniform bool rustleColorCheck; // use color checking for limiting rustling; currently not usable; see rustle()
uniform float rustleFactor; // amount of rustling
uniform float rustleFrequency; // frequency of rustles

// functions
void bend(inout vec3);
void rustle(inout vec3);
vec3 rgb2hsv(vec3);
vec3 hsv2rgb(vec3);
float smoothCurve(float);
float triangleWave(float);
float smoothTriangleWave(float);
vec4 smoothTriangleWave(vec4);

void main(void) {
	vColor = color;
	float length = length(position.xyz);
	vec3 pos = position;
	bend(pos);
	rustle(pos);
	gl_PointSize = pointSize;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(normalize(pos.xyz) * length, 1.0);
}

void bend(inout vec3 pos) {
	if(pos.x > bendHeightLimit) {
	float bend = (sin(time * speedFactor) + 1.0) * bendFactor;
	float clampedX = max(pos.x, bendHeightLimit); // coordinate system is rotated -> x is up
	float bf = (clampedX - bendHeightLimit) * bend;
		vec3 newPos = pos;
		newPos.yz += wind.xy * bf; // trees' supposed xz plane is yz b/c rotation; if the wind direction is off, flip the coordinates
		pos = newPos;
	}
}

void rustle(inout vec3 pos) {
	vec3 hsv = rgb2hsv(color);
	// values by trial and error, mostly
	if(pos.x > rustleHeightLimit) {
		if(!rustleColorCheck || (hsv.x > 0.16 && hsv.x < 0.5 && hsv.y > 0.18 && hsv.z > 0.08)) {
			// vColor.r = 1.0; // uncomment to debug height limit and HVS comparisons
			// vColor.g = 0.0;
			// vColor.b = 0.0;
			vec3 newPos = pos;
			float objPhase = length(modelMatrix[3].xyz); // assign unique phase to each object
			float vtxYPhase = pos.y + objPhase; // vary vertex phases according to location
			float vtxZPhase = pos.z + objPhase; // on the yz plane (ground plane b/c rotated models)
			vec2 wavesIn = vec2(vtxYPhase + time, vtxZPhase + time);
			vec4 waves = (fract(wavesIn.xxyy *
			   vec4(SIDE_TO_SIDE_FREQ1, SIDE_TO_SIDE_FREQ2, UP_AND_DOWN_FREQ1, UP_AND_DOWN_FREQ2)) *
			   2.0 - 1.0 ) * speedFactor * rustleFrequency; // lifted from crytek paper: http://http.developer.nvidia.com/GPUGems3/gpugems3_ch16.html
			waves = smoothTriangleWave(waves);
			vec2 wavesSum = waves.xz + waves.yw;
			newPos.y += wavesSum.y * (pos.x - rustleHeightLimit) * rustleFactor / 100.0;
			newPos.z += wavesSum.x * (pos.x - rustleHeightLimit) * rustleFactor / 100.0;
			pos = newPos;
		}
	}
}

// run-of-the-mill rgb-hsv-conversions
vec3 rgb2hsv(vec3 c) {
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// general math
float smoothCurve(float x) {
	return x * x * (3.0 - 2.0 * x);
}
float triangleWave(float x) {
	return abs(fract(x + 0.5) * 2.0 - 1.0);
}
float smoothTriangleWave(float x) {
	return smoothCurve(triangleWave(x));
}
vec4 smoothTriangleWave(vec4 v) {
	float x = smoothTriangleWave(v.x);
	float y = smoothTriangleWave(v.y);
	float z = smoothTriangleWave(v.z);
	float w = smoothTriangleWave(v.w);
	return vec4(x, y, z, w);
}