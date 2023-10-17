"use client";
import useVideoStore from "@/store/useVideoStore";
import { RepeatClockIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  ListItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  UnorderedList,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

export default function History() {
  const storedHistory = useVideoStore((state) => state.history);
  const [history, setHistory] = useState(null);
  const clearHistory = useVideoStore((state) => state.clearHistory);
  const containerRef = useRef(null);

  const toBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    toBottom();
  }, [history]);

  useEffect(() => {
    setHistory(storedHistory);
  }, [storedHistory]);

  return (
    <Popover onOpen={toBottom}>
      <PopoverTrigger>
        <IconButton
          aria-label="History"
          icon={<RepeatClockIcon />}
          variant="link"
        >
          History
        </IconButton>
      </PopoverTrigger>
      <PopoverContent
        maxHeight="60vh"
        width={{
          base: "100vw",
          md: "550px",
        }}
      >
        <PopoverHeader>History</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody ref={containerRef} overflow="auto" p={4}>
          {history?.length ? (
            <HistoryVideos videos={history} />
          ) : (
            <EmptyHistory />
          )}
        </PopoverBody>
        {history?.length ? (
          <PopoverFooter as={Flex} justifyContent="flex-end">
            <Button variant="link" size="sm" onClick={clearHistory}>
              Clear
            </Button>
          </PopoverFooter>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function EmptyHistory() {
  return null;
}

function HistoryVideos({ videos }) {
  return (
    <UnorderedList spacing={2}>
      {videos.map((video, index) => (
        <Video key={`${video.videoId}` + index} video={video} />
      ))}
    </UnorderedList>
  );
}

function Video({ video }) {
  const url = `https://youtube.com/watch?v=${video.videoId}`;

  return (
    <ListItem>
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
        <Heading size="sm">{video.videoTitle || "Video"}</Heading>
      </Link>
    </ListItem>
  );
}
