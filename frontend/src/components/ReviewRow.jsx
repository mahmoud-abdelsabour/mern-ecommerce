import { useMemo, useState } from "react"
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  HStack,
  Portal,
  RatingGroup,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react"
import ReviewCard from "./ReviewCard"
import { useDeleteReview, useUpdateReview } from "../hooks/useProductReviews"
import { useStoredUser } from "../hooks/useStoredUser"
import { getToken } from "../APIs/http"
import { notify } from "../utils/notify"

const MAX_COMMENT = 1000

const getReviewUserId = (review) => {
  const u = review?.user
  if (u == null) return ""
  if (typeof u === "string" || typeof u === "number") return String(u)
  return String(u._id ?? u.id ?? "")
}

const getReviewId = (review) => review?.id ?? review?._id ?? ""

const ReviewRow = ({ review, productId }) => {
  const me = useStoredUser()
  const reviewId = getReviewId(review)
  const authorId = getReviewUserId(review)

  const isOwner = useMemo(() => {
    if (!getToken() || !reviewId || !authorId) return false
    const myId = me?.id != null ? String(me.id) : ""
    return Boolean(myId) && myId === authorId
  }, [me?.id, authorId, reviewId])

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState("")

  const updateMutation = useUpdateReview(productId)
  const deleteMutation = useDeleteReview(productId)

  const openEditDialog = () => {
    setEditRating(Number(review?.rating) || 0)
    setEditComment(String(review?.comment ?? ""))
    setEditOpen(true)
  }

  const displayName = review?.name || review?.user?.name || "Customer"
  const displayDate = review?.createdAt
    ? new Date(review.createdAt).toLocaleDateString()
    : "—"
  const displayRating = Number(review?.rating ?? 0)
  const displayComment = review?.comment ?? ""

  const onSaveEdit = () => {
    const trimmed = editComment.trim()
    if (trimmed.length > MAX_COMMENT) {
      notify.warning(
        "Comment too long",
        `Please keep your comment under ${MAX_COMMENT} characters.`
      )
      return
    }
    const rating = Number(editRating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      notify.warning("Rating required", "Please choose a star rating from 1 to 5.")
      return
    }
    updateMutation.mutate(
      { reviewId, rating, comment: trimmed },
      {
        onSuccess: () => {
          notify.success("Review updated", "Your changes have been saved.")
          setEditOpen(false)
        },
      }
    )
  }

  const onConfirmDelete = () => {
    deleteMutation.mutate(reviewId, {
      onSuccess: () => {
        notify.success("Review removed", "Your review was deleted.")
        setDeleteOpen(false)
      },
    })
  }

  return (
    <Stack gap={2} align="stretch">
      <ReviewCard
        name={displayName}
        date={displayDate}
        rating={displayRating}
        comment={displayComment}
      />
      {isOwner ? (
        <HStack gap={2} justify="flex-end" flexWrap="wrap">
          <Button
            size="xs"
            variant="ghost"
            onClick={openEditDialog}
            disabled={updateMutation.isPending || deleteMutation.isPending}
          >
            Edit
          </Button>
          <Button
            size="xs"
            variant="ghost"
            colorPalette="red"
            onClick={() => setDeleteOpen(true)}
            disabled={updateMutation.isPending || deleteMutation.isPending}
          >
            Delete
          </Button>
        </HStack>
      ) : null}

      <Dialog.Root
        open={editOpen}
        onOpenChange={(e) => setEditOpen(e.open)}
        size="md"
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
              <Dialog.Header>
                <Dialog.Title>Edit your review</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <Field.Root>
                    <Field.Label>Rating</Field.Label>
                    <RatingGroup.Root
                      count={5}
                      size="sm"
                      value={editRating}
                      onValueChange={(e) => setEditRating(Number(e.value) || 0)}
                    >
                      <RatingGroup.HiddenInput />
                      <RatingGroup.Control />
                    </RatingGroup.Root>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Comment (optional)</Field.Label>
                    <Textarea
                      value={editComment}
                      maxLength={MAX_COMMENT}
                      onChange={(ev) => setEditComment(ev.target.value)}
                      minH="100px"
                      placeholder="Update your feedback…"
                    />
                    <Text fontSize="xs" color="text.muted" mt={1}>
                      {editComment.length}/{MAX_COMMENT}
                    </Text>
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <HStack gap={2} justify="flex-end" w="full">
                  <Button variant="outline" onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    colorPalette="brand"
                    onClick={onSaveEdit}
                    loading={updateMutation.isPending}
                    disabled={updateMutation.isPending}
                  >
                    Save
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root
        role="alertdialog"
        open={deleteOpen}
        onOpenChange={(e) => setDeleteOpen(e.open)}
        size="sm"
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
              <Dialog.Header>
                <Dialog.Title>Delete review</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text fontSize="sm">
                  Remove this review permanently? This cannot be undone.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <HStack gap={2} justify="flex-end" w="full">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteOpen(false)}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorPalette="red"
                    onClick={onConfirmDelete}
                    loading={deleteMutation.isPending}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Stack>
  )
}

export default ReviewRow
