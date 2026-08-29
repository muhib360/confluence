/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["better-sqlite3", "onnxruntime-node", "@huggingface/transformers"],
};

export default nextConfig;
