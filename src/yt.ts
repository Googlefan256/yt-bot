import { createAudioResource } from "@discordjs/voice";
import { search } from "yt-search";
import { validateID } from "ytdl-core";
import ytdl from "ytdl-core";

export function dl(q: Video) {
    const video = ytdl(q.id, {
        quality: "highestaudio",
        filter: "audioonly",
    });
    return createAudioResource(video);
}

export async function ys(query: string) {
    let v = null;
    if (validateID(query)) {
        v = await search({ videoId: query });
    } else {
        const { videos } = await search(query);
        v = videos[0];
    }
    if (!v) return null;
    return {
        title: v.title,
        description: v.description,
        id: v.videoId,
        image: v.image,
        footer: `${v.duration.timestamp},${v.views}回`,
    };
}

export type AsyncReturnType<T extends (...args: any) => any> =
    ReturnType<T> extends Promise<infer S> ? S : never;

export type Video = NonNullable<AsyncReturnType<typeof ys>>;
