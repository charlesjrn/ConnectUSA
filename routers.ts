          await db.favoriteVerse(ctx.user.id, input.verseId);
          return { favorited: true };
        }
      }),
  }),

  users: router({
    getDonorBadge: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserDonorBadge(input.userId);
      }),
    getSpotlight: publicProcedure.query(async () => {
      // Check if there's a manually featured member first
      const featured = await db.getFeaturedMember();
      if (featured) return featured;
      
      // Fallback to automatic selection
      const spotlight = await db.getMemberSpotlight();
      return spotlight;
    }),
    setFeaturedMember: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {