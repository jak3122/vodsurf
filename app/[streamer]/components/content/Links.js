"use client";
import useSettings from "@/store/useSettings";
import useVideoStore from "@/store/useVideoStore";
import {
  Box,
  Card,
  CardBody,
  Container,
  Heading,
  Image,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";

const { format } = new Intl.NumberFormat();

export default function Links() {
  const videos = useVideoStore((state) => state.videos);
  const settings = useSettings((state) => state.settings);

  return (
    <Box h="full" w="full" overflow="auto">
      <Container maxW="container.lg">
        <Stack gap={3} py={8}>
          {videos.map((video, index) => (
            <VideoCard video={video} key={index} />
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

function VideoCard({ video }) {
  const url = `https://youtube.com/watch?v=${video.videoId}`;
  const viewCount = video.viewCount ? format(video.viewCount) : null;
  const thumbnail = `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`;
  const publishedAt = new Date(video.publishedAt).toLocaleDateString();

  return (
    <Card
      direction={{
        base: "column",
        sm: "row",
      }}
    >
      <Box
        height="170px"
        width={{
          base: "100%",
          sm: "300px",
        }}
      >
        <Image src={thumbnail} alt={video.videoTitle} objectFit="cover" />
      </Box>
      <CardBody>
        <Link href={url} isExternal>
          <Heading size="md" h="50px">
            {video.videoTitle || "Video"}
          </Heading>
        </Link>
        <Text>{video.channelTitle || "Channel"}</Text>
        <Text>{publishedAt || "Date"}</Text>
        <Text display="flex" alignItems="center">
          <ViewIcon boxSize={5} mr={1} />
          {viewCount || "Views"}
        </Text>
      </CardBody>
    </Card>
  );
}
