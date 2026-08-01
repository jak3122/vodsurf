"use client";
import useStreamer from "@/hooks/useStreamer";
import useSettings, { defaultSettings, playerModes } from "@/store/useSettings";
import { SmallCloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Grid,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Switch,
  Text,
  VStack,
  useRadio,
  useRadioGroup,
} from "@chakra-ui/react";
import { forwardRef, useId } from "react";
import { useForm } from "react-hook-form";

const strategies = [
  { value: "by_duration", label: "by duration", hint: "Favors longer videos" },
  { value: "by_video", label: "by video", hint: "Every video equally likely" },
  {
    value: "greatest_hits",
    label: "greatest hits",
    hint: "Favors popular videos",
  },
  {
    value: "hidden_gems",
    label: "hidden gems",
    hint: "Favors overlooked videos",
  },
];

const linkCounts = [1, 2, 3, 4, 5];

export default function Settings({ modal }) {
  const settings = useSettings((state) => state.settings);
  const setSettings = useSettings((state) => state.setSettings);
  const { register, handleSubmit, watch, setValue, getValues, reset } = useForm(
    { defaultValues: settings },
  );

  const streamer = useStreamer();
  const accent = streamer.theme.button.bg;
  const accentText = streamer.theme.button.text;

  const mode = watch("mode");
  const count = watch("count");
  const strategy = watch("strategy");
  const channels = watch("channels")?.[streamer.route];
  const dateLow = watch("dateLow");
  const dateHigh = watch("dateHigh");

  const handleChannelChange = (values) => {
    setValue("channels", {
      ...getValues("channels"),
      [streamer.route]: values,
    });
  };

  const onSubmit = (data) => {
    setSettings(data);
    modal.onClose();
  };

  const onCancel = () => {
    reset(settings);
    modal.onClose();
  };

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={onCancel}
      size="2xl"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        mx={3}
        borderRadius="lg"
        overflow="hidden"
        borderTop="4px solid"
        borderTopColor={streamer.theme.accent}
        boxShadow="dark-lg"
      >
        <ModalHeader
          fontSize="md"
          fontWeight="semibold"
          letterSpacing="wide"
          py={3}
          borderBottom="1px solid"
          borderBottomColor="whiteAlpha.200"
        >
          Settings
        </ModalHeader>
        <ModalCloseButton top={2} />

        <ModalBody
          p={{ base: 3, md: 5 }}
          sx={checkedStyles(accent, accentText)}
        >
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={{ base: 3, md: 4 }}
            alignItems="start"
          >
            <Section title="Mode" gridColumn={{ md: "1 / -1" }}>
              <Segmented
                name="mode"
                value={mode}
                onChange={(v) => setValue("mode", v)}
                options={Object.values(playerModes).map((m) => ({
                  value: m,
                  label: m,
                }))}
                accent={accent}
                accentText={accentText}
                maxW="440px"
              />
              {mode === playerModes.LINKS && (
                <Flex
                  align="center"
                  justify="space-between"
                  gap={3}
                  mt={3}
                  pt={3}
                  borderTop="1px solid"
                  borderTopColor="whiteAlpha.200"
                >
                  <Text fontSize="sm" color="whiteAlpha.800">
                    Links per pick
                  </Text>
                  <Segmented
                    name="count"
                    value={String(count)}
                    onChange={(v) => setValue("count", Number(v))}
                    options={linkCounts.map((n) => ({
                      value: String(n),
                      label: String(n),
                    }))}
                    accent={accent}
                    accentText={accentText}
                    flex="0 0 auto"
                    w="180px"
                  />
                </Flex>
              )}
            </Section>

            <Column>
              <Section title="Strategy">
                <RadioGroup
                  value={strategy}
                  onChange={(v) => setValue("strategy", v)}
                >
                  <VStack align="stretch" spacing={1}>
                    {strategies.map((s) => (
                      <Radio
                        key={s.value}
                        value={s.value}
                        alignItems="flex-start"
                        py={1.5}
                        sx={{ "& > .chakra-radio__control": { mt: "3px" } }}
                      >
                        <Text fontSize="sm" lineHeight="short">
                          {s.label}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.600">
                          {s.hint}
                        </Text>
                      </Radio>
                    ))}
                  </VStack>
                </RadioGroup>
              </Section>

              <Section title="Channels">
                <CheckboxGroup value={channels} onChange={handleChannelChange}>
                  <VStack align="stretch" spacing={2}>
                    {streamer.channels.map((channel) => (
                      <Checkbox
                        key={channel.channelId}
                        value={channel.channelId}
                        alignItems="flex-start"
                        sx={{ "& > .chakra-checkbox__control": { mt: "3px" } }}
                      >
                        <Text fontSize="sm" lineHeight="short">
                          {channel.title}
                        </Text>
                      </Checkbox>
                    ))}
                  </VStack>
                </CheckboxGroup>
              </Section>
            </Column>

            <Column>
              <Section title="Playback">
                <VStack align="stretch" spacing={2}>
                  <ToggleRow label="Autoplay">
                    <Switch {...register("autoplay")} size="sm" />
                  </ToggleRow>
                  <ToggleRow label="Random timestamp">
                    <Switch {...register("randomStart")} size="sm" />
                  </ToggleRow>
                </VStack>
              </Section>

              <Section title="Timers">
                <VStack align="stretch" spacing={3}>
                  <TimerRow
                    label="Endless mode"
                    isDimmed={mode !== playerModes.ENDLESS}
                    register={register}
                    name="timer"
                    accent={accent}
                  />
                  <TimerRow
                    label="Sleep timer"
                    register={register}
                    name="sleepTimer"
                    accent={accent}
                  />
                </VStack>
              </Section>

              <Section title="Date range">
                <VStack align="stretch" spacing={2}>
                  <DateRow
                    label="From"
                    value={dateLow}
                    accent={accent}
                    onClear={() => setValue("dateLow", defaultSettings.dateLow)}
                    {...register("dateLow")}
                  />
                  <DateRow
                    label="To"
                    value={dateHigh}
                    accent={accent}
                    onClear={() =>
                      setValue("dateHigh", defaultSettings.dateHigh)
                    }
                    {...register("dateHigh")}
                  />
                </VStack>
              </Section>
            </Column>
          </Grid>
        </ModalBody>

        <ModalFooter
          gap={3}
          borderTop="1px solid"
          borderTopColor="whiteAlpha.200"
          py={3}
        >
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            px={6}
            bg={accent}
            color={accentText}
            _hover={{ bg: streamer.theme.button.hover.bg }}
            _active={{ transform: "translateY(1px)" }}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Paints Chakra's checked radios/checkboxes/switches in the streamer's accent
// instead of the default blue. Scoped to the modal body it is applied to.
function checkedStyles(accent, accentText) {
  const controls = [
    ".chakra-radio__control[data-checked]",
    ".chakra-radio__control[data-checked]:hover",
    ".chakra-checkbox__control[data-checked]",
    ".chakra-checkbox__control[data-checked]:hover",
  ];

  return {
    [controls.join(", ")]: {
      bg: accent,
      borderColor: accent,
      color: accentText,
    },
    ".chakra-switch__track[data-checked]": { bg: accent },
  };
}

function Column({ children }) {
  return (
    <VStack align="stretch" spacing={{ base: 3, md: 4 }} minW={0}>
      {children}
    </VStack>
  );
}

function Section({ title, children, ...props }) {
  const id = useId();

  return (
    <Box
      as="fieldset"
      aria-labelledby={id}
      // fieldset defaults to min-inline-size: min-content, which would keep the
      // grid columns from shrinking on narrow screens
      minW={0}
      bg="whiteAlpha.50"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="md"
      p={{ base: 3, md: 4 }}
      {...props}
    >
      <Text
        id={id}
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="0.08em"
        color="whiteAlpha.600"
        mb={3}
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

function ToggleRow({ label, children }) {
  return (
    <Flex as="label" align="center" justify="space-between" cursor="pointer">
      <Text fontSize="sm">{label}</Text>
      {children}
    </Flex>
  );
}

function Segmented({
  name,
  value,
  onChange,
  options,
  accent,
  accentText,
  ...props
}) {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    value,
    onChange,
  });

  return (
    <HStack
      {...getRootProps()}
      spacing={1}
      p={1}
      bg="blackAlpha.400"
      borderRadius="md"
      {...props}
    >
      {options.map((option) => (
        <Segment
          key={option.value}
          accent={accent}
          accentText={accentText}
          {...getRadioProps({ value: option.value })}
        >
          {option.label}
        </Segment>
      ))}
    </HStack>
  );
}

function Segment({ children, accent, accentText, ...props }) {
  const { getInputProps, getRadioProps } = useRadio(props);
  const input = getInputProps();
  const radio = getRadioProps();

  return (
    <Box as="label" flex="1" cursor="pointer">
      <input {...input} />
      <Box
        {...radio}
        textAlign="center"
        fontSize="sm"
        py={1.5}
        borderRadius="sm"
        color="whiteAlpha.700"
        transition="background 0.15s, color 0.15s"
        _hover={{ bg: "whiteAlpha.100", color: "white" }}
        _checked={{
          bg: accent,
          color: accentText,
          fontWeight: "semibold",
          _hover: { bg: accent, color: accentText },
        }}
        _focusVisible={{ boxShadow: "outline" }}
      >
        {children}
      </Box>
    </Box>
  );
}

function TimerRow({ label, name, register, isDimmed, accent }) {
  return (
    <Box opacity={isDimmed ? 0.5 : 1} transition="opacity 0.15s">
      <Text fontSize="xs" color="whiteAlpha.700" mb={1.5}>
        {label}
      </Text>
      <HStack spacing={2}>
        {["h", "m", "s"].map((unit) => (
          <TimerField
            key={unit}
            unit={unit}
            accent={accent}
            aria-label={`${label} ${unit}`}
            {...register(`${name}.${unit}`)}
          />
        ))}
      </HStack>
    </Box>
  );
}

const TimerField = forwardRef(({ unit, accent, ...props }, ref) => {
  return (
    <InputGroup size="sm" w="72px" flex="0 0 auto">
      <Input
        type="number"
        min={0}
        pl={2}
        pr={6}
        focusBorderColor={accent}
        borderRadius="md"
        onClick={(e) => e.target.select()}
        sx={{
          MozAppearance: "textfield",
          "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
        }}
        {...props}
        ref={ref}
      />
      <InputRightElement
        w="1.5rem"
        pointerEvents="none"
        fontSize="xs"
        color="whiteAlpha.600"
      >
        {unit}
      </InputRightElement>
    </InputGroup>
  );
});
TimerField.displayName = "TimerField";

const DateRow = forwardRef(
  ({ label, value, onClear, accent, ...props }, ref) => {
    return (
      <HStack spacing={2}>
        <Text
          fontSize="xs"
          color="whiteAlpha.700"
          w="2.25rem"
          flexShrink={0}
          as="label"
          htmlFor={props.name}
        >
          {label}
        </Text>
        <InputGroup size="sm" minW={0}>
          <Input
            id={props.name}
            type="date"
            borderRadius="md"
            minW={0}
            pr={value ? 7 : 2}
            focusBorderColor={accent}
            sx={{
              "&::-webkit-calendar-picker-indicator": {
                filter: "invert(1)",
                opacity: 0.6,
                cursor: "pointer",
              },
            }}
            {...props}
            ref={ref}
          />
          {value && (
            <InputRightElement w="1.75rem">
              <IconButton
                aria-label={`Clear ${label.toLowerCase()} date`}
                icon={<SmallCloseIcon />}
                size="xs"
                variant="ghost"
                color="whiteAlpha.600"
                _hover={{ color: "white", bg: "whiteAlpha.200" }}
                onClick={onClear}
              />
            </InputRightElement>
          )}
        </InputGroup>
      </HStack>
    );
  },
);
DateRow.displayName = "DateRow";
