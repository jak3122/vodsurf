"use client";
import useVideoStore from "@/store/useVideoStore";
import {
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

  return (
    <Container maxW="container.lg">
      <Stack gap={2} py={8}>
        {videos.map((video, index) => (
          <VideoCard video={video} key={index} />
        ))}
      </Stack>
    </Container>
  );
}

function VideoCard({ video }) {
  const url = `https://youtube.com/watch?v=${video.videoId}`;
  const viewCount = video.viewCount ? format(video.viewCount) : null;
  const thumbnail = `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`;

  return (
    <Card
      direction={{
        base: "column",
        sm: "row",
      }}
    >
      <Image
        src={thumbnail}
        alt={video.videoTitle}
        objectFit="cover"
        maxW={{
          base: "100%",
          sm: "250px",
        }}
      />
      <CardBody>
        <Link href={url} isExternal>
          <Heading size="md">{video.videoTitle || "Video"}</Heading>
        </Link>
        <Text>{video.channelTitle || "Channel"}</Text>
        <Text>{video.publishedAt || "Date"}</Text>
        <Text display="flex" alignItems="center">
          <ViewIcon boxSize={5} mr={1} />
          {viewCount || "Views"}
        </Text>
      </CardBody>
    </Card>
  );
}
