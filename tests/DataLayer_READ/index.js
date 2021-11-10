const { setFloat16, getFloat16 } = float16;

const SUCCESS = 'success';
const ERROR = 'error';
const WARNING = 'warning';

requirejs([
	'../../dist/webgl-compute',
	'../deps/micromodal.min',
], (
	{ WebGLCompute, HALF_FLOAT, FLOAT, UNSIGNED_BYTE, BYTE, UNSIGNED_SHORT, SHORT, UNSIGNED_INT, INT, GLSL3, GLSL1, CLAMP_TO_EDGE, REPEAT, NEAREST, LINEAR },
	MicroModal,
) => {
	const canvas = document.getElementById('glcanvas');
	MicroModal.init();

	function offsetProgramForType(type, glslVersion) {
		if (glslVersion === GLSL1) {
			return `
precision highp float;

varying vec2 v_UV;

uniform sampler2D u_state;
uniform vec2 u_offset;

void main() {
	gl_FragColor = texture2D(u_state, v_UV + u_offset);
}`;
		}
		switch (type) {
			case HALF_FLOAT:
			case FLOAT:
				return `#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 v_UV;

uniform sampler2D u_state;
uniform vec2 u_offset;

out vec4 out_fragColor;

void main() {
	out_fragColor = texture(u_state, v_UV + u_offset);
}`;
			case UNSIGNED_BYTE:
			case UNSIGNED_SHORT:
			case UNSIGNED_INT:
				return `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;

in vec2 v_UV;

uniform usampler2D u_state;
uniform vec2 u_offset;

out uvec4 out_fragColor;

void main() {
	out_fragColor = texture(u_state, v_UV + u_offset);
}`;
			case BYTE:
			case SHORT:
			case INT:
				return `#version 300 es
precision highp float;
precision highp int;
precision highp isampler2D;

in vec2 v_UV;

uniform isampler2D u_state;
uniform vec2 u_offset;

out ivec4 out_fragColor;

void main() {
	out_fragColor = texture(u_state, v_UV + u_offset);
}`;
			default:
				throw new Error(`Invalid type: ${type}.`);
		}
	}

	// General code for testing array writes.
	function testArrayReads(options) {

		const { 
			TYPE,
			DIM_X,
			DIM_Y,
			NUM_ELEMENTS,
			GLSL_VERSION,
			WRAP,
			FILTER,
			TEST_EXTREMA,
		} = options;

		let OFFSET = 0;
		if (WRAP !== CLAMP_TO_EDGE) OFFSET = 1;
		if (FILTER !== NEAREST) OFFSET = 0.75;

		const config = {
			readwrite: true,
			type: TYPE,
			dimensions: `[${DIM_X}, ${DIM_Y}]`,
			num_channels: NUM_ELEMENTS,
			wrap: WRAP,
			filter: FILTER,
		};

		try {
			const glcompute = new WebGLCompute({
				canvas,
				antialias: true,
				glslVersion: GLSL_VERSION,
			});
			config.webgl_version = glcompute.isWebGL2() ? 'WebGL 2' : 'WebGL 1';
			config.glsl_version = GLSL_VERSION === GLSL1 ? 'glsl 1' : 'glsl 3';

			let input;
			let NUM_EXTREMA = 0;
			let NUM_TYPE_EXTREMA = 0;
			let NUM_HALF_FLOAT_INT_EXTREMA = 0;
			let NUM_FLOAT_INT_EXTREMA = 0;

			const MIN_UNSIGNED_INT = 0;
			const MIN_BYTE = -(2 ** 7);
			const MAX_BYTE = 2 ** 8 - 1;
			const MIN_SHORT = -(2 ** 15);
			const MAX_SHORT = 2 ** 16 - 1;
			const MIN_INT = -(2 ** 31);
			const MAX_INT = 2 ** 31 - 1;
			const MIN_FLOAT_INT = -16777216;
			const MAX_FLOAT_INT = 16777216;
			const MIN_HALF_FLOAT_INT = -2048;
			const MAX_HALF_FLOAT_INT = -2048;

			switch (TYPE) {
				case HALF_FLOAT: {
					input = new Float32Array(DIM_X * DIM_Y * NUM_ELEMENTS);
					const uint16Array = new Uint16Array(1);
					const view = new DataView(uint16Array.buffer);
					
					if (TEST_EXTREMA) {
						// Test extrema values.
						NUM_EXTREMA = 4;
						// https://en.wikipedia.org/wiki/Half-precision_floating-point_format
						// Minimum positive value.
						setFloat16(view, 0,  2 ** -24, true);
						input[0] = getFloat16(view, 0, true);
						// Minimum negative value.
						setFloat16(view, 0,  -(2 ** -24), true);
						input[1] = getFloat16(view, 0, true);
						// Maximum positive value.
						setFloat16(view, 0,  (2 - 2 ** -10) * 2 ** 15, true);
						input[2] = getFloat16(view, 0, true);
						// Maximum negative value.
						setFloat16(view, 0,  -(2 - 2 ** -10) * 2 ** 15, true);
						input[3] = getFloat16(view, 0, true);
					} else {
						// Fill with float data.
						for (let i = 0; i < input.length; i++) {
							const float32Value = (i - input.length / 2) * 0.1;
							// We need to make sure we use a valid float16 value.
							setFloat16(view, 0, float32Value, true);
							input[i] = getFloat16(view, 0, true);
						}
					}
					break;
				}
				case FLOAT: {
					input = new Float32Array(DIM_X * DIM_Y * NUM_ELEMENTS);

					if (TEST_EXTREMA) {
						// Test extrema values.
						NUM_EXTREMA = 4;
						// https://en.wikipedia.org/wiki/Single-precision_floating-point_format
						// Minimum positive value.
						input[0] = 2 ** -126;
						// Minimum negative value.
						input[1] = -input[0];
						// Maximum positive value.
						input[2] = (2 - 2 ** -23) * 2 ** 127;
						// Maximum negative value.
						input[3] = -input[2];
					} else {
						// Fill with float data.
						for (let i = 0; i < input.length; i++) {
							input[i] = (i - input.length / 2) * 0.1;
						}
					}
					break;
				}
				case UNSIGNED_BYTE: {
					input = new Uint8Array(DIM_X * DIM_Y * NUM_ELEMENTS);
					if (TEST_EXTREMA) {
						// Test extrema values.
						NUM_TYPE_EXTREMA = 4;
						NUM_EXTREMA = NUM_TYPE_EXTREMA;
						// Minimum values.
						input[0] = MIN_UNSIGNED_INT;
						input[1] = input[0] + 1;
						// Maximum values.
						input[2] = MAX_BYTE;
						input[3] = input[2] - 1;
					} else {
						// Fill with uint8 data.
						for (let i = 0; i < input.length; i++) {
							input[i] = i;
						}
					}
					break;
				}
				case UNSIGNED_SHORT: {
					input = new Uint16Array(DIM_X * DIM_Y * NUM_ELEMENTS);
					
					if (TEST_EXTREMA) {
						// Test extrema values.
						NUM_TYPE_EXTREMA = 4;
						NUM_HALF_FLOAT_INT_EXTREMA = 2;
						NUM_EXTREMA = NUM_TYPE_EXTREMA + NUM_HALF_FLOAT_INT_EXTREMA;
						// Minimum values.
						input[0] = MIN_UNSIGNED_INT;
						input[1] = input[0] + 1;
						// Maximum values.
						input[2] = MAX_SHORT;
						input[3] = input[2] - 1;
						// Check that at least half float values are supported.
						input[4] = MAX_HALF_FLOAT_INT;
						input[5] = input[4] - 1;
					} else {
						// Fill with uint16 data.
						for (let i = 0; i < input.length; i++) {
							input[i] = i;
						}
					}
					break;
				}
				case UNSIGNED_INT: {
					input = new Uint32Array(DIM_X * DIM_Y * NUM_ELEMENTS);
					
					if (TEST_EXTREMA) {
						// Test extrema values.
						NUM_TYPE_EXTREMA = 4;
						NUM_FLOAT_INT_EXTREMA = 2;
						NUM_HALF_FLOAT_INT_EXTREMA = 2;
						NUM_EXTREMA = NUM_TYPE_EXTREMA + NUM_HALF_FLOAT_INT_EXTREMA + NUM_FLOAT_INT_EXTREMA;
						// Minimum values.
						input[0] = MIN_UNSIGNED_INT;
						input[1] = input[0] + 1;
						// Maximum values.
						input[2] = MAX_INT;
						input[3] = input[2] - 1;
						// Check that at least float values are supported.
						input[4] = MAX_FLOAT_INT;
						input[5] = input[4] - 1;
						// Check that at least half float values are supported.
						input[6] = MAX_HALF_FLOAT_INT;
						input[7] = input[4] - 1;
					} else {
						// Fill with uint32 data.
						for (let i = 0; i < input.length; i++) {
							input[i] = i;
						}
					}
					break;
				}
				case BYTE: {
					input = new Int8Array(DIM_X * DIM_Y * NUM_ELEMENTS);

					if (TEST_EXTREMA) {
						// Test extrema values.
						NUM_TYPE_EXTREMA = 4;
						NUM_EXTREMA = NUM_TYPE_EXTREMA;
						// Minimum values.
						input[0] = MIN_BYTE;
						input[1] = input[0] + 1;
						// Maximum values.
						input[2] = MAX_BYTE;
						input[3] = input[2] - 1;
					} else {
						// Fill with int8 data.
						for (let i = 0; i < input.length; i++) {
							input[i] = (i - Math.floor(length / 2));
						}
					}
					break;
				}
				case SHORT: {
					input = new Int16Array(DIM_X * DIM_Y * NUM_ELEMENTS);
					
					if (TEST_EXTREMA) {
						// Test extrema values.
						NUM_TYPE_EXTREMA = 4;
						NUM_HALF_FLOAT_INT_EXTREMA = 4;
						NUM_EXTREMA = NUM_TYPE_EXTREMA + NUM_HALF_FLOAT_INT_EXTREMA;
						// Minimum values.
						input[0] = MIN_SHORT;
						input[1] = input[0] + 1;
						// Maximum values.
						input[2] = MAX_SHORT;
						input[3] = input[2] - 1;
						// Check that at least half float values are supported.
						input[4] = MIN_HALF_FLOAT_INT;
						input[5] = input[4] + 1;
						input[6] = MAX_HALF_FLOAT_INT;
						input[7] = input[6] - 1;
					} else {
						// Fill with int16 data.
						for (let i = 0; i < input.length; i++) {
							input[i] = (i - Math.floor(length / 2));
						}
					}
					break;
				}
				case INT: {
					input = new Int32Array(DIM_X * DIM_Y * NUM_ELEMENTS);
					
					if (TEST_EXTREMA) {
						// Test extrema values.
						NUM_TYPE_EXTREMA = 4;
						NUM_FLOAT_INT_EXTREMA = 4;
						NUM_HALF_FLOAT_INT_EXTREMA = 4;
						NUM_EXTREMA = NUM_TYPE_EXTREMA + NUM_HALF_FLOAT_INT_EXTREMA + NUM_FLOAT_INT_EXTREMA;
						// Minimum values.
						input[0] = MIN_INT;
						input[1] = input[0] + 1;
						// Maximum values.
						input[2] = MAX_INT;
						input[3] = input[2] - 1;
						// Check that at least float values are supported.
						input[4] = MIN_FLOAT_INT;
						input[5] = input[4] + 1;
						input[6] = MAX_FLOAT_INT;
						input[7] = input[6] - 1;
						// Check that at least half float values are supported.
						input[8] = MIN_HALF_FLOAT_INT;
						input[9] = input[8] + 1;
						input[10] = MAX_HALF_FLOAT_INT;
						input[11] = input[10] - 1;
					} else {
						// Fill with int32 data.
						const length = input.length - NUM_EXTREMA;
						for (let i = 0; i < input.length; i++) {
							input[i] = (i - Math.floor(length / 2));
						}
					}
					break;
				}
				default:
					throw new Error(`Invalid type ${TYPE}.`);
			}

			const dataLayer = glcompute.initDataLayer(
				{
					name: `test-${TYPE}`,
					dimensions: [DIM_X, DIM_Y],
					type: TYPE,
					numComponents: NUM_ELEMENTS,
					data: input,
					filter: FILTER,
					wrapS: WRAP,
					wrapT: WRAP,
					writable: true,
					numBuffers: 2,
				},
			);

			const offsetProgram = glcompute.initProgram({
				name: 'offset',
				fragmentShader: offsetProgramForType(TYPE, GLSL_VERSION),
				uniforms: [
						{
							name: 'u_state',
							value: 0,
							dataType: INT,
						},
						{
							name: 'u_offset',
							value: [OFFSET / DIM_X, OFFSET / DIM_Y],
							dataType: FLOAT,
						},
					],
				},
			);

			glcompute.step(offsetProgram, [dataLayer], dataLayer);
			const output = glcompute.getValues(dataLayer);

			glcompute.destroy();

			let status = SUCCESS;
			const error = [];
			const log = [];
			const typeMismatch =  TYPE !== dataLayer.internalType;
			if (typeMismatch) {
				log.push(`Unsupported type ${TYPE} for the current configuration, using type ${dataLayer.internalType} internally.`);
			}
			if (WRAP !== dataLayer.internalWrapS || WRAP !== dataLayer.internalWrapT) {
				error.push(`Unsupported boundary wrap ${WRAP} for the current configuration, using wrap [${dataLayer.internalWrapS}, ${dataLayer.internalWrapT}] internally.`);
			}
			if (glcompute.gl[FILTER] !== dataLayer.glFilter) {
				const filter = dataLayer.glFilter === glcompute.gl[NEAREST] ? NEAREST : LINEAR;
				error.push(`Unsupported interpolation filter ${FILTER} for the current configuration, using filter ${filter} internally.`);
			}

			if (TEST_EXTREMA) {
				const extremaError = [];
				const extremaWarning = [];
				let typeExtremaSupported = true;
				let floatExtremaSupported = true;
				let halfFloatExtremaSupported = true;
				for (let i = 0; i < input.length; i++) {
					if (input[i] !== output[i]) {
						if (i < NUM_TYPE_EXTREMA) {
							typeExtremaSupported = false;
						} else if (i < NUM_TYPE_EXTREMA + NUM_FLOAT_INT_EXTREMA) {
							floatExtremaSupported = false;
						} else if (i < NUM_TYPE_EXTREMA + NUM_FLOAT_INT_EXTREMA + NUM_HALF_FLOAT_INT_EXTREMA) {
							halfFloatExtremaSupported = false;
						}
					}
				}
				const extremaSupported = typeExtremaSupported && floatExtremaSupported && halfFloatExtremaSupported;
				if (
					!halfFloatExtremaSupported || // Half float extrema should always be supported.
					(!floatExtremaSupported && dataLayer.internalType !== HALF_FLOAT) || // Float extrema should always be supported unless using half float type.
					(!extremaSupported && !typeMismatch) // Extrema should be supported if using correct internal type.
				) {
					status = ERROR;
					extremaError.push(`Type extrema not supported:\n${allMismatches.join('\n')}.`);
				}

				// Check int support.
				if (
					typeMismatch &&
					(TYPE === UNSIGNED_BYTE || TYPE === BYTE || TYPE === UNSIGNED_SHORT || TYPE === SHORT || TYPE === UNSIGNED_INT || TYPE === INT) &&
					!typeExtremaSupported
				) {
					let min = MIN_HALF_FLOAT_INT;
					let max = MAX_HALF_FLOAT_INT;
					if (dataLayer.internalType === FLOAT) {
						min = MIN_FLOAT_INT;
						max = MAX_FLOAT_INT;
					}
					status = WARNING;
					extremaWarning.push(`Internal data type ${dataLayer.internalType} supports integers in range ${min.toLocaleString("en-US")} to ${max.toLocaleString("en-US")}.  Current type ${TYPE} contains integers in range ${input[0].toLocaleString("en-US")} to ${input[2].toLocaleString("en-US")}.`);
				}
				return {
					status,
					log,
					error,
					extremaError,
					extremaWarning,
					config,
				};
			}

			// All values of output should be 1 if test passed.
			if (input.length !== output.length) {
				status = ERROR;
				error.push(`Invalid output array: expected length ${input.length}, got length ${output.length}.`);
				return {
					status,
					log,
					error,
					config,
				};
			}
			
			let allMismatches = [];
			for (let i = 0; i < output.length; i++) {
				if (output[i] !== 1) {
					allMismatches.push(`expected: ${1}, got: ${output[i]}`);
				}
			}

			if (allMismatches.length === output.length) {
				status = ERROR;
				error.push(`All elements of output array do not match expected values:<br/>${allMismatches.join('<br/>')}.`);
				return {
					status,
					log,
					error,
					config,
				};
			}

			if (allMismatches.length) {
				status = ERROR;
				error.push(`Output array contains invalid elements:<br/>${allMismatches.join('<br/>')}.`);
				return {
					status,
					log,
					error,
					config,
				};
			}

			return {
				status,
				log,
				error,
				config,
			};
		} catch (error) {
			return {
				status: ERROR,
				error: [error.message],
				config,
			};
		}
	}

	// makeTable(testArrayReads);
});