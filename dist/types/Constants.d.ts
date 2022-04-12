export declare const HALF_FLOAT = "HALF_FLOAT";
export declare const FLOAT = "FLOAT";
export declare const UNSIGNED_BYTE = "UNSIGNED_BYTE";
export declare const BYTE = "BYTE";
export declare const UNSIGNED_SHORT = "UNSIGNED_SHORT";
export declare const SHORT = "SHORT";
export declare const UNSIGNED_INT = "UNSIGNED_INT";
export declare const INT = "INT";
export declare const BOOL = "BOOL";
export declare const UINT = "UINT";
export declare const LINEAR = "LINEAR";
export declare const NEAREST = "NEAREST";
export declare const REPEAT = "REPEAT";
export declare const CLAMP_TO_EDGE = "CLAMP_TO_EDGE";
export declare const RGB = "RGB";
export declare const RGBA = "RGBA";
export declare type DataLayerArray = Float32Array | Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array;
export declare const validArrayTypes: (Float32ArrayConstructor | Uint8ArrayConstructor | Int8ArrayConstructor | Uint16ArrayConstructor | Int16ArrayConstructor | Uint32ArrayConstructor | Int32ArrayConstructor | ArrayConstructor)[];
export declare type DataLayerType = typeof HALF_FLOAT | typeof FLOAT | typeof UNSIGNED_BYTE | typeof BYTE | typeof UNSIGNED_SHORT | typeof SHORT | typeof UNSIGNED_INT | typeof INT;
export declare const validDataTypes: string[];
export declare type DataLayerNumComponents = 1 | 2 | 3 | 4;
export declare type DataLayerFilter = typeof LINEAR | typeof NEAREST;
export declare const validFilters: string[];
export declare const validWraps: string[];
export declare type DataLayerWrap = typeof REPEAT | typeof CLAMP_TO_EDGE;
export declare type TextureFormat = typeof RGB | typeof RGBA;
export declare const validTextureFormats: string[];
export declare type TextureType = typeof UNSIGNED_BYTE;
export declare const validTextureTypes: string[];
export declare const GLSL3 = "300 es";
export declare const GLSL1 = "100";
export declare type GLSLVersion = typeof GLSL1 | typeof GLSL3;
export declare const FLOAT_1D_UNIFORM = "1f";
export declare const FLOAT_2D_UNIFORM = "2f";
export declare const FLOAT_3D_UNIFORM = "3f";
export declare const FLOAT_4D_UNIFORM = "3f";
export declare const INT_1D_UNIFORM = "1i";
export declare const INT_2D_UNIFORM = "2i";
export declare const INT_3D_UNIFORM = "3i";
export declare const INT_4D_UNIFORM = "3i";
export declare type UniformType = typeof FLOAT | typeof INT | typeof BOOL;
export declare type UniformInternalType = typeof FLOAT_1D_UNIFORM | typeof FLOAT_2D_UNIFORM | typeof FLOAT_3D_UNIFORM | typeof FLOAT_4D_UNIFORM | typeof INT_1D_UNIFORM | typeof INT_2D_UNIFORM | typeof INT_3D_UNIFORM | typeof INT_4D_UNIFORM;
export declare type UniformValue = boolean | number | [
    number
] | [
    number,
    number
] | [
    number,
    number,
    number
] | [
    number,
    number,
    number,
    number
];
export declare type Uniform = {
    location: {
        [key: string]: WebGLUniformLocation;
    };
    type: UniformInternalType;
    value: UniformValue;
};
export declare const DEFAULT_PROGRAM_NAME = "DEFAULT";
export declare const DEFAULT_W_UV_PROGRAM_NAME = "DEFAULT_W_UV";
export declare const DEFAULT_W_NORMAL_PROGRAM_NAME = "DEFAULT_W_NORMAL";
export declare const DEFAULT_W_UV_NORMAL_PROGRAM_NAME = "DEFAULT_W_UV_NORMAL";
export declare const SEGMENT_PROGRAM_NAME = "SEGMENT";
export declare const DATA_LAYER_POINTS_PROGRAM_NAME = "DATA_LAYER_POINTS";
export declare const DATA_LAYER_LINES_PROGRAM_NAME = "DATA_LAYER_LINES";
export declare const DATA_LAYER_VECTOR_FIELD_PROGRAM_NAME = "DATA_LAYER_VECTOR_FIELD";
export declare type PROGRAM_NAME_INTERNAL = typeof DEFAULT_PROGRAM_NAME | typeof DEFAULT_W_UV_PROGRAM_NAME | typeof DEFAULT_W_NORMAL_PROGRAM_NAME | typeof DEFAULT_W_UV_NORMAL_PROGRAM_NAME | typeof SEGMENT_PROGRAM_NAME | typeof DATA_LAYER_POINTS_PROGRAM_NAME | typeof DATA_LAYER_LINES_PROGRAM_NAME | typeof DATA_LAYER_VECTOR_FIELD_PROGRAM_NAME;
export declare type CompileTimeVars = {
    [key: string]: string;
};
export declare type DataLayerBuffer = {
    texture: WebGLTexture;
    framebuffer?: WebGLFramebuffer;
};
export declare type ErrorCallback = (message: string) => void;
export declare const DEFAULT_CIRCLE_NUM_SEGMENTS = 18;
