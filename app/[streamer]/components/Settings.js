"use client";
import useStreamer from "@/hooks/useStreamer";
import useSettings, { playerModes } from "@/store/useSettings";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Grid,
  HStack,
  Input,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Radio,
  RadioGroup,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Settings({ modal }) {
  const settings = useSettings((state) => state.settings);
  const setSettings = useSettings((state) => state.setSettings);
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: settings,
  });

  const streamer = useStreamer();
  const mode = watch("mode");
  const count = watch("count");

  const [selectedChannels, setSelectedChannels] = useState(
    settings.channels[streamer.route]
  );
  const [selectedMode, setSelectedMode] = useState(settings.mode);
  const [selectedCount, setSelectedCount] = useState(settings.count);
  const [selectedStrategy, setSelectedStrategy] = useState(settings.strategy);

  const handleChannelChange = (values) => {
    setSelectedChannels(values);
    setValue("channels", {
      ...settings.channels,
      [streamer.route]: values,
    });
  };

  const handleModeChange = (value) => {
    setSelectedMode(value);
    setValue("mode", value);
  };

  const handleCountChange = (value) => {
    setSelectedCount(value);
    setValue("count", value);
  };

  const handleStrategyChange = (value) => {
    setSelectedStrategy(value);
    setValue("strategy", value);
  };

  const onSubmit = (data) => {
    setSettings(data);
    modal.onClose();
  };

  const columns = useBreakpointValue({ base: 1, md: 2 });

  return (
    <Modal isOpen={modal.isOpen} onClose={modal.onClose} size="2xl">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalCloseButton />
        <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={4} p={4}>
          <Box as="fieldset">
            <legend>Mode</legend>
            <RadioGroup value={selectedMode} onChange={handleModeChange}>
              <HStack spacing="24px">
                {Object.values(playerModes).map((m) => (
                  <Radio key={m} value={m}>
                    {m}
                  </Radio>
                ))}
              </HStack>
            </RadioGroup>
          </Box>

          {mode === playerModes.LINKS ? (
            <Box as="fieldset">
              <legend>Count: {count}</legend>
              <Slider
                value={selectedCount}
                onChange={handleCountChange}
                min={1}
                max={5}
                step={1}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          ) : (
            <Box />
          )}

          <Box as="fieldset">
            <legend>Strategy</legend>
            <RadioGroup
              value={selectedStrategy}
              onChange={handleStrategyChange}
            >
              <VStack align="start">
                <Radio value="by_duration">by duration</Radio>
                <Radio value="by_video">by video</Radio>
                <Radio value="greatest_hits">greatest hits</Radio>
                <Radio value="hidden_gems">hidden gems</Radio>
              </VStack>
            </RadioGroup>
          </Box>

          <Box as="fieldset">
            <legend>Channels</legend>
            <CheckboxGroup
              value={selectedChannels}
              onChange={handleChannelChange}
            >
              <VStack align="start">
                {streamer.channels.map((channel) => (
                  <Checkbox key={channel.channelId} value={channel.channelId}>
                    {channel.username}
                  </Checkbox>
                ))}
              </VStack>
            </CheckboxGroup>
          </Box>

          <Box as="fieldset">
            <legend>Options</legend>
            <VStack align="start">
              <Checkbox {...register("autoplay")}>Autoplay</Checkbox>
              <Checkbox {...register("randomStart")}>Random Start</Checkbox>
            </VStack>
          </Box>

          <Box as="fieldset" direction="column">
            <legend>Timer</legend>
            <HStack spacing={4} align="center">
              <HStack spacing={1} align="center">
                <Text>H</Text>
                <Input {...register("timer.h")} type="number" />
              </HStack>
              <HStack spacing={1} align="center">
                <Text>M</Text>
                <Input {...register("timer.m")} type="number" />
              </HStack>
              <HStack spacing={1} align="center">
                <Text>S</Text>
                <Input {...register("timer.s")} type="number" />
              </HStack>
            </HStack>
          </Box>
        </Grid>

        <ModalFooter>
          <Button type="submit">Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
