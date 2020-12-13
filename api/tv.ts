import {
  AsyncReturnType,
  EpisodeData,
  SeasonData,
  TrackableData,
  TrackableSource,
  TrackableType,
} from "@types";
import { mapAsync } from "@utils";
import { TVListResult } from "themoviedb-typescript/build/src/interfaces/generic";
import {
  EpisodeWithExtras,
  SeasonWithEpisodes,
  Show,
} from "themoviedb-typescript/build/src/interfaces/tv";
import { tmdb } from "./tmdb";

const getData = async (id: string) => {
  const tv = await tmdb.tv.getById(id);
  const seasons: SeasonWithEpisodes[] = await mapAsync(tv.seasons, (season) =>
    tmdb.tvSeasons.getById(id, season.season_number)
  );
  return { ...tv, id, seasons };
};

export type RawDataType = AsyncReturnType<typeof getData>;

const transform = (show: RawDataType): TrackableData => ({
  type: TrackableType.Tv,
  id: show.id.toString(),
  name: show.name,
  description: show.overview,
  genres: show.genres.map((g) => g.name),
  poster: `https://image.tmdb.org/t/p/w300/${show.poster_path}`,
  runtime: show.episode_run_time[0],
  seasons: show.seasons.map(transformSeason),
});

const transformSeason = (season: SeasonWithEpisodes): SeasonData => ({
  season: season.season_number,
  name: season.name,
  description: season.overview,
  episodes: season.episodes.map(transformEpisode),
});

const transformEpisode = (episode: EpisodeWithExtras): EpisodeData => ({
  episode: episode.episode_number,
  season: episode.season_number,
  name: episode.name,
  description: episode.name,
  airDate: episode.air_date,
});

const transformSearch = (show: TVListResult) => ({
  type: TrackableType.Tv,
  id: show.id.toString(),
  name: show.name,
});

export const tv: TrackableSource = {
  type: TrackableType.Tv,
  getData,
  transform,
  transformSearch,
};
