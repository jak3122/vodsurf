"use client";
import useSettings from "@/store/useSettings";
import useStreamer from "@/hooks/useStreamer";
import useVideoStore from "@/store/useVideoStore";
import {
  Box,
  Card,
  CardBody,
  Container,
  Heading,
  Image,
  Link,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

const { format } = new Intl.NumberFormat();

export default function Links() {
  const videos = useVideoStore((state) => state.videos);
  const settings = useSettings((state) => state.settings);

  if (!videos || !videos?.length) return null;

  return (
    <Box h="full" w="full" overflow="auto">
      <Container maxW="container.lg">
        <Stack gap={3} py={8}>
          {Array.from({ length: settings.count }).map((_, index) => (
            <VideoCard key={index} video={videos[index]} />
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

function VideoCard({ video }) {
  const streamer = useStreamer();
  const [isLoaded, setIsLoaded] = useState(false);
  const url = `https://youtube.com/watch?v=${video?.videoId}`;
  const viewCount = video?.viewCount ? format(video?.viewCount) : null;
  const thumbnail = `https://i.ytimg.com/vi/${video?.videoId}/mqdefault.jpg`;
  const publishedAt = new Date(video?.publishedAt).toLocaleDateString();

  useEffect(() => {
    setIsLoaded(false);
  }, [video?.videoId]);

  if (!video) return null;

  return (
    <Card
      direction={{
        base: "column",
        md: "row",
      }}
    >
      <Box
        height={{
          md: "170px",
        }}
        width={{
          base: "100%",
          md: "300px",
        }}
      >
        <Skeleton
          isLoaded={isLoaded}
          fadeDuration={0.5}
          h="full"
          startColor={streamer.theme.primary}
        >
          <Image
            src={thumbnail}
            alt={video.videoTitle}
            objectFit="cover"
            aspectRatio={16 / 9}
            h="full"
            width="full"
            onLoad={() => setIsLoaded(true)}
          />
        </Skeleton>
      </Box>
      <CardBody>
        <Box minH="50px" w="full">
          <Link
            href={url}
            isExternal
            display="-webkit-box"
            title={video.videoTitle}
            sx={{
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            }}
          >
            <Heading size="md">{video.videoTitle || "Video"}</Heading>
          </Link>
        </Box>
        <Text>{video.channelTitle || "Channel"}</Text>
        <Text>{publishedAt || "Date"}</Text>
        <Text display="flex" alignItems="center">
          <ViewIcon boxSize={5} mr={2} />
          {viewCount || "Views"}
        </Text>
      </CardBody>
    </Card>
  );
}
