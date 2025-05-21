import type { UseServiceOptions } from "@/types";

export const getDepsFromOptions = (options?: UseServiceOptions): (string | undefined)[] => {
    if (!options) return [];

    if ('key' in options) return [options.key];
    if ('use' in options) return [options.use];

    return [];
}