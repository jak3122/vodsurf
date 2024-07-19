"use client";
import useStreamer from "@/hooks/useStreamer";
import useSettings, { defaultSettings, playerModes } from "@/store/useSettings";
import { CloseIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Grid,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalBody,
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
  Tooltip,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { forwardRef, useState } from "react";
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

  const resetDateLow = () => {
    setValue("dateLow", defaultSettings.dateLow);
  };

  const resetDateHigh = () => {
    setValue("dateHigh", defaultSettings.dateHigh);
  };

  const onSubmit = (data) => {
    setSettings(data);
    modal.onClose();
  };

  const columns = useBreakpointValue({ base: 1, md: 2 });

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={modal.onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={4} p={4}>
            <Fieldset>
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
            </Fieldset>

            {mode === playerModes.LINKS ? (
              <Fieldset>
                <legend>Links: {count}</legend>
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
              </Fieldset>
            ) : (
              <Box />
            )}

            <Fieldset>
              <legend>Strategy</legend>
              <RadioGroup
                value={selectedStrategy}
                onChange={handleStrategyChange}
              >
                <VStack align="start">
                  <HStack spacing={2}>
                    <Radio value="by_duration">by duration</Radio>
                    <Info>
                      Videos are weighted by duration (longer videos are more
                      likely)
                    </Info>
                  </HStack>
                  <HStack spacing={2}>
                    <Radio value="by_video">by video</Radio>
                    <Info>Videos are weighted equally</Info>
                  </HStack>
                  <HStack spacing={2}>
                    <Radio value="greatest_hits">greatest hits</Radio>
                    <Info>
                      Videos are weighted by view count (more popular videos are
                      more likely)
                    </Info>
                  </HStack>
                  <HStack spacing={2}>
                    <Radio value="hidden_gems">hidden gems</Radio>
                    <Info>
                      Videos are weighted by inverse view count (less popular
                      videos are more likely)
                    </Info>
                  </HStack>
                </VStack>
              </RadioGroup>
            </Fieldset>

            <Fieldset>
              <legend>Channels</legend>
              <CheckboxGroup
                value={selectedChannels}
                onChange={handleChannelChange}
              >
                <VStack align="start">
                  {streamer.channels.map((channel) => (
                    <Checkbox key={channel.channelId} value={channel.channelId}>
                      {channel.title}
                    </Checkbox>
                  ))}
                </VStack>
              </CheckboxGroup>
            </Fieldset>

            <Fieldset>
              <legend>Options</legend>
              <VStack align="start">
                <Checkbox {...register("autoplay")}>Autoplay</Checkbox>
                <Checkbox {...register("randomStart")}>
                  Random timestamp
                </Checkbox>
              </VStack>
            </Fieldset>

            <Fieldset direction="column">
              <legend>Endless mode timer</legend>
              <HStack spacing={4} align="center">
                <HStack spacing={1} align="center">
                  <Text>H</Text>
                  <TimerField {...register("timer.h")} />
                </HStack>
                <HStack spacing={1} align="center">
                  <Text>M</Text>
                  <TimerField {...register("timer.m")} />
                </HStack>
                <HStack spacing={1} align="center">
                  <Text>S</Text>
                  <TimerField {...register("timer.s")} />
                </HStack>
              </HStack>
            </Fieldset>

            <Fieldset gridColumnStart={1} gridColumnEnd={{ base: 1, md: 3 }}>
              <legend>Date range</legend>
              <HStack spacing={1}>
                <InputGroup>
                  <Input type="date" {...register("dateLow")} />
                  <InputRightAddon p={0}>
                    <IconButton
                      aria-label="Reset low date"
                      variant="link"
                      icon={<CloseIcon />}
                      onClick={resetDateLow}
                      width="full"
                      height="full"
                    />
                  </InputRightAddon>
                </InputGroup>
                <Box>—</Box>
                <InputGroup>
                  <Input type="date" {...register("dateHigh")} />
                  <InputRightAddon p={0}>
                    <IconButton
                      aria-label="Reset high date"
                      variant="link"
                      icon={<CloseIcon />}
                      onClick={resetDateHigh}
                      width="full"
                      height="full"
                    />
                  </InputRightAddon>
                </InputGroup>
              </HStack>
            </Fieldset>
          </Grid>
        </ModalBody>

        <ModalFooter justifyContent="center">
          <Button type="submit" colorScheme="blue">
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function Fieldset({ children, ...props }) {
  return (
    <Box as="fieldset" border="1px solid #ffffff95" p={3} {...props}>
      {children}
    </Box>
  );
}

const TimerField = forwardRef(({ children, ...props }, ref) => {
  return (
    <Input
      type="number"
      onClick={(e) => e.target.select()}
      {...props}
      ref={ref}
    />
  );
});
TimerField.displayName = "TimerField";

function Info({ children }) {
  return (
    <Tooltip label={children} placement="right" closeOnClick={false} hasArrow>
      <InfoOutlineIcon />
    </Tooltip>
  );
}
