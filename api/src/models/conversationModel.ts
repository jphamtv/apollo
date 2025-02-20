import { PrismaClient, Prisma } from "@prisma/client";
import { ConversationWithDetails } from "../types";

const prisma = new PrismaClient();

export const create = async (data: Prisma.ConversationCreateInput): Promise<ConversationWithDetails> => {
  return prisma.conversation.create({
    data,
    include: {
      messages: true,
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });
};

export const findConversationsByUserId = async (userId: string) => {
  return prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  displayName: true,
                  imageUrl: true
                }
              }
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });
};

export const findById = async (id: string): Promise<ConversationWithDetails | null> => {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: true,
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });
};

export const findExistingConversationByParticipants = async (participantIds: string[]) => {
  // Special case for direct (non-group) conversations
  if (participantIds.length === 2) {
    return prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          // Both participants must be in this conversation
          { participants: { some: { userId: participantIds[0] } } },
          { participants: { some: { userId: participantIds[1] } } },
          // Total participant count must be exactly 2
          { participants: { none: { userId: { notIn: participantIds } } } }
        ]
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profile: {
                  select: {
                    displayName: true,
                    imageUrl: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  
  // For group conversations 
  return prisma.conversation.findFirst({
    where: {
      isGroup: true,
      // All specified participants must be in the conversation
      AND: [
        ...participantIds.map(id => ({
          participants: { some: { userId: id } }
        })),
        // For groups, ensure ONLY these participants exist
        {
          participants: {
            none: {
              userId: { notIn: participantIds }
            }
          }
        }
      ]
    },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' }
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  displayName: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      }
    }
  });
};

export const update = async (
  id: string,
  data: Prisma.ConversationUpdateInput
): Promise<ConversationWithDetails | null> => {
  return prisma.conversation.update({
    where: { id },
    data,
    include: {
      messages: true,
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });
};

export const addParticipant = async (
  conversationId: string,
  userId: string
) => {
  return prisma.conversationParticipant.create({
    data: {
      conversation: { connect: { id: conversationId } },
      user: { connect: { id: userId } },
    },
  });
};

export const removeParticipant = async (
  conversationId: string,
  userId: string
) => {
  return prisma.conversationParticipant.delete({
    where: {
      userId_conversationId: {
        userId,
        conversationId,
      },
    },
  });
};

export const isParticipant = async (
  userId: string,
  conversationId: string
): Promise<boolean> => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId,
        conversationId
      }
    }
  });
  return !!participant; // "!!"" converts to boolean
};

export const deleteById = async (id: string): Promise<void> => {
  await prisma.$transaction([
    prisma.conversationParticipant.deleteMany({
      where: { conversationId: id },
    }),
    prisma.message.deleteMany({
      where: { conversationId: id },
    }),
    prisma.conversation.delete({
      where: { id },
    }),
  ]);
};


export default {
  create,
  findById,
  findConversationsByUserId,
  findExistingConversationByParticipants,
  update,
  addParticipant,
  removeParticipant,
  isParticipant,
  deleteById,
};