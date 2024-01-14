import { createAudioResource } from "@discordjs/voice";
import { search } from "yt-search";
import { stream } from "play-dl";
import { validateID } from "ytdl-core";

export async function dl(q: string) {
    const video = await stream(q, {
        discordPlayerCompatibility: true,
    });
    return createAudioResource(video.stream);
}

export async function fetchPlaylist(id: string) {
    try {
        const { videos } = await search({ listId: id });
        return videos.map((v) => ({
            title: v.title,
            description: v.title,
            id: v.videoId,
            image: v.thumbnail || "",
            footer: `${v.duration.timestamp}`,
        }));
    } catch (e) {
        return null;
    }
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
