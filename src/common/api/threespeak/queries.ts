import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "../../core";
import { getAllVideoStatuses } from "./api";
import { useMappedStore } from "../../store/use-mapped-store";
import { ThreeSpeakVideo } from "./types";

export function useThreeSpeakVideo(filterStatus: ThreeSpeakVideo["status"] | "all") {
  const { activeUser } = useMappedStore();
  const apiQuery = useQuery(
    [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST],
    async () => {
      try {
        return await getAllVideoStatuses(activeUser!.username);
      } catch (e) {
        console.error(e);
      }
      return [];
    },
    {
      initialData: []
    }
  );

  return useQuery(
    [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST_FILTERED, filterStatus],
    () => {
      if (filterStatus === "all") {
        return apiQuery.data!!;
      }
      return apiQuery.data!!.filter((video: ThreeSpeakVideo) => video.status === filterStatus);
    },
    {
      initialData: [],
      enabled: apiQuery.data?.length > 0
    }
  );
}
