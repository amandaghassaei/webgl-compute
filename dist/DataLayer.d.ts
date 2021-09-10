import { DataLayerArrayType, DataLayerFilterType, DataLayerNumComponents, DataLayerType, DataLayerWrapType, GLSLVersion } from './Constants';
export declare type DataLayerBuffer = {
    texture: WebGLTexture;
    framebuffer?: WebGLFramebuffer;
};
declare type ErrorCallback = (message: string) => void;
export declare class DataLayer {
    readonly name: string;
    private readonly gl;
    private readonly errorCallback;
    private _bufferIndex;
    readonly numBuffers: number;
    private readonly buffers;
    private length?;
    private width;
    private height;
    readonly type: DataLayerType;
    readonly internalType: DataLayerType;
    readonly wrapS: DataLayerWrapType;
    readonly wrapT: DataLayerWrapType;
    readonly internalWrapS: DataLayerWrapType;
    readonly internalWrapT: DataLayerWrapType;
    readonly numComponents: DataLayerNumComponents;
    readonly filter: DataLayerFilterType;
    readonly internalFilter: DataLayerFilterType;
    readonly writable: boolean;
    private textureOverrides?;
    readonly glInternalFormat: number;
    readonly glFormat: number;
    readonly glType: number;
    readonly glNumChannels: number;
    readonly glWrapS: number;
    readonly glWrapT: number;
    readonly glFilter: number;
    constructor(params: {
        gl: WebGLRenderingContext | WebGL2RenderingContext;
        name: string;
        dimensions: number | [number, number];
        type: DataLayerType;
        numComponents: DataLayerNumComponents;
        glslVersion: GLSLVersion;
        data?: DataLayerArrayType;
        filter?: DataLayerFilterType;
        wrapS?: DataLayerWrapType;
        wrapT?: DataLayerWrapType;
        writable?: boolean;
        numBuffers?: number;
        errorCallback: ErrorCallback;
    });
    private static calcSize;
    private static getInternalWrap;
    private static getInternalFilter;
    private static getInternalType;
    private static shouldCastIntTypeAsFloat;
    private static getGLTextureParameters;
    private static testFramebufferWrite;
    get bufferIndex(): number;
    saveCurrentStateToDataLayer(layer: DataLayer): void;
    _setCurrentStateTexture(texture: WebGLTexture): void;
    private validateDataArray;
    private initBuffers;
    getCurrentStateTexture(): WebGLTexture;
    getPreviousStateTexture(index?: number): WebGLTexture;
    _usingTextureOverrideForCurrentBuffer(): WebGLTexture | undefined;
    _bindOutputBufferForWrite(incrementBufferIndex: boolean): void;
    _bindOutputBuffer(): void;
    setData(data: DataLayerArrayType): void;
    resize(dimensions: number | [number, number], data?: DataLayerArrayType): void;
    clear(): void;
    getDimensions(): [number, number];
    getLength(): number;
    private destroyBuffers;
    destroy(): void;
}
export {};
