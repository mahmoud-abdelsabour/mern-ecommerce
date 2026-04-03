import { Avatar, Box, HStack, Stack, Text, RatingGroup } from "@chakra-ui/react"

const ReviewCard = ({ name, date, rating = 0, comment, avatarUrl }) => {
  return (
    <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
      <Stack gap={3}>
        <HStack justify="space-between" align="center">
          <HStack gap={3}>
            <Avatar.Root size="sm">
              <Avatar.Fallback name={name} />
              <Avatar.Image src={avatarUrl} />
            </Avatar.Root>
            <Text fontWeight="600">{name}</Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {date}
          </Text>
        </HStack>

        <RatingGroup.Root readOnly count={5} defaultValue={rating} size="sm">
          <RatingGroup.HiddenInput />
          <RatingGroup.Control />
        </RatingGroup.Root>

        <Text fontSize="sm" color="gray.600">
          {comment}
        </Text>
      </Stack>
    </Box>
  )
}

export default ReviewCard
