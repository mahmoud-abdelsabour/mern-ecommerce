import { Avatar, Box, HStack, Stack, Text, RatingGroup } from "@chakra-ui/react"

const ReviewCard = ({ name, date, rating = 0, comment, avatarUrl }) => {
  return (
    <Box borderWidth="1px" borderColor="surface.border" bg="surface.panel" rounded="lg" p={4}>
      <Stack gap={3}>
        <HStack justify="space-between" align="center">
          <HStack gap={3}>
            <Avatar.Root size="sm">
              <Avatar.Fallback name={name} />
              <Avatar.Image src={avatarUrl} />
            </Avatar.Root>
            <Text fontWeight="600">{name}</Text>
          </HStack>
          <Text fontSize="xs" color="text.muted">
            {date}
          </Text>
        </HStack>

        <RatingGroup.Root readOnly count={5} value={rating} size="sm">
          <RatingGroup.HiddenInput />
          <RatingGroup.Control />
        </RatingGroup.Root>

        <Text fontSize="sm" color="text.subtle">
          {comment}
        </Text>
      </Stack>
    </Box>
  )
}

export default ReviewCard
