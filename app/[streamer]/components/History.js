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
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

export default function History() {
  const storedHistory = useVideoStore((state) => state.history);
  const [history, setHistory] = useState(null);
  const clearHistory = useVideoStore((state) => state.clearHistory);
  const containerRef = useRef(null);
  const { isOpen, onToggle, onClose } = useDisclosure();

  const toBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const onClear = () => {
    clearHistory();
    onClose();
  };

  useEffect(() => {
    toBottom();
  }, [history]);

  useEffect(() => {
    setHistory(storedHistory);
  }, [storedHistory]);

  return (
    <Popover onOpen={toBottom} isOpen={isOpen} onClose={onClose}>
      <PopoverTrigger>
        <IconButton
          aria-label="History"
          icon={<RepeatClockIcon />}
          variant="link"
          onClick={onToggle}
        >
          History
        </IconButton>
      </PopoverTrigger>
      <PopoverContent
        maxHeight={{
          base: "calc(100vh - 46px)",
          md: "60vh",
        }}
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
            <Button variant="link" size="sm" onClick={onClear}>
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
