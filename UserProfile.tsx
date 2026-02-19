
  const followMutation = trpc.follows.follow.useMutation({
    onSuccess: () => refetchIsFollowing(),
  });

  const unfollowMutation = trpc.follows.unfollow.useMutation({
    onSuccess: () => refetchIsFollowing(),
  });

  const createMilestoneMutation = trpc.milestones.create.useMutation({
    onSuccess: () => {
      toast.success("Milestone added!");
      setMilestoneDialogOpen(false);
      setNewMilestone({ title: "", description: "", milestoneDate: "", milestoneType: "other" });
      refetchMilestones();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMilestoneMutation = trpc.milestones.update.useMutation({
    onSuccess: () => {
      toast.success("Milestone updated!");
      setEditingMilestone(null);
      refetchMilestones();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMilestoneMutation = trpc.milestones.delete.useMutation({
    onSuccess: () => {
      toast.success("Milestone deleted!");
      refetchMilestones();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowMutation.mutateAsync({ userId });
    } else {
      await followMutation.mutateAsync({ userId });
    }
  };

  const handleCreateMilestone = () => {
    if (!newMilestone.title || !newMilestone.milestoneDate) {
      toast.error("Please fill in title and date");
      return;
    }
    createMilestoneMutation.mutate(newMilestone);
  };

  const handleUpdateMilestone = () => {
    if (!editingMilestone) return;
    updateMilestoneMutation.mutate({
      id: editingMilestone.id,
      title: editingMilestone.title,
      description: editingMilestone.description,
      milestoneDate: editingMilestone.milestoneDate,
      milestoneType: editingMilestone.milestoneType,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDaysSince = (date: Date | string | null) => {
    if (!date) return null;
    const startDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (