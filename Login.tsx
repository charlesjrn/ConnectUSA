      }
      signupMutation.mutate({ email, password, name });
    } else {
      loginMutation.mutate({ email, password });
    }
  };

  const isPending = loginMutation.isPending || signupMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img 
              src="/chosen-connect-logo.png" 
              alt="Chosen Connect" 
              className="h-32 w-auto"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-center text-amber-900">
            Chosen Connect
          </CardTitle>
          <CardDescription className="text-center">
            {isSignup ? "Create your account" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Login */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Continue with Manus OAuth
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignup ? "At least 8 characters" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isSignup ? 8 : undefined}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={isPending}
            >
              {isPending ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </Button>

            {!isSignup && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setLocation("/forgot-password")}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  Forgot Password?
                </Button>
              </div>
            )}
          </form>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-amber-600 hover:text-amber-700 underline"
            >
              {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
