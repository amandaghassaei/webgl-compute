"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = "\nvarying vec2 vUV;\nuniform sampler2D u_state;\n\nvoid main() {\n\tgl_FragColor = texture2D(u_state, vUV);\n}";
//# sourceMappingURL=PassThroughShader.js.map