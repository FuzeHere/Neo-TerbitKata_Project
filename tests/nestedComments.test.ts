import { describe, it, expect } from "vitest";

interface Comment {
  id: string;
  name: string;
  content: string;
  parentId: string | null;
  createdAt: string;
}

// Function that groups replies under parent comments (just like our CommentSection component does)
function groupCommentsAndReplies(comments: Comment[]) {
  const rootComments = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => c.parentId);

  const getRepliesForComment = (commentId: string) => {
    return replies
      .filter((r) => r.parentId === commentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  return {
    rootComments,
    getRepliesForComment,
  };
}

describe("Nested Comments Threading", () => {
  const mockComments: Comment[] = [
    {
      id: "comment-1",
      name: "Budi",
      content: "Artikel bagus!",
      parentId: null,
      createdAt: "2026-06-26T10:00:00.000Z",
    },
    {
      id: "comment-2",
      name: "Andi",
      content: "Saya kurang setuju dengan paragraf ke-3.",
      parentId: null,
      createdAt: "2026-06-26T10:05:00.000Z",
    },
    {
      id: "reply-1",
      name: "Siti",
      content: "Setuju Budi, analisisnya mendalam.",
      parentId: "comment-1",
      createdAt: "2026-06-26T10:15:00.000Z",
    },
    {
      id: "reply-2",
      name: "Budi",
      content: "Siti, terima kasih dukungannya.",
      parentId: "comment-1",
      createdAt: "2026-06-26T10:20:00.000Z",
    },
    {
      id: "reply-3",
      name: "Joko",
      content: "Kenapa tidak setuju Andi?",
      parentId: "comment-2",
      createdAt: "2026-06-26T10:10:00.000Z",
    },
  ];

  it("should separate root comments and replies", () => {
    const { rootComments } = groupCommentsAndReplies(mockComments);
    
    expect(rootComments).toHaveLength(2);
    expect(rootComments.map((c) => c.id)).toContain("comment-1");
    expect(rootComments.map((c) => c.id)).toContain("comment-2");
  });

  it("should link replies to correct parent comments", () => {
    const { getRepliesForComment } = groupCommentsAndReplies(mockComments);
    
    const repliesTo1 = getRepliesForComment("comment-1");
    expect(repliesTo1).toHaveLength(2);
    expect(repliesTo1[0].id).toBe("reply-1");
    expect(repliesTo1[1].id).toBe("reply-2");

    const repliesTo2 = getRepliesForComment("comment-2");
    expect(repliesTo2).toHaveLength(1);
    expect(repliesTo2[0].id).toBe("reply-3");
  });

  it("should sort replies chronologically (oldest first)", () => {
    const { getRepliesForComment } = groupCommentsAndReplies(mockComments);
    
    const repliesTo1 = getRepliesForComment("comment-1");
    // reply-1 (10:15) should be before reply-2 (10:20)
    expect(repliesTo1[0].id).toBe("reply-1");
    expect(repliesTo1[1].id).toBe("reply-2");

    // Let's check with reverse input order in comments array
    const disorderedComments: Comment[] = [
      {
        id: "reply-2",
        name: "Budi",
        content: "Siti, terima kasih dukungannya.",
        parentId: "comment-1",
        createdAt: "2026-06-26T10:20:00.000Z",
      },
      {
        id: "reply-1",
        name: "Siti",
        content: "Setuju Budi, analisisnya mendalam.",
        parentId: "comment-1",
        createdAt: "2026-06-26T10:15:00.000Z",
      },
    ];

    const { getRepliesForComment: getDisorderedReplies } = groupCommentsAndReplies(disorderedComments);
    const sortedReplies = getDisorderedReplies("comment-1");
    expect(sortedReplies[0].id).toBe("reply-1"); // 10:15
    expect(sortedReplies[1].id).toBe("reply-2"); // 10:20
  });
});
