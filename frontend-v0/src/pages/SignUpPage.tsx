import { useState, useRef, type FormEvent, type ChangeEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Building2, User, Mail, Phone, Lock, ImagePlus, ArrowRight } from "lucide-react"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function SignUpPage() {
  const navigate = useNavigate()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setLogoPreview(URL.createObjectURL(file))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    navigate("/admin")
  }

  return (
    <AuthLayout
      heading="Create employee account"
      subheading="Set up your company workspace and onboard your first team member."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Logo upload */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label="Upload company logo"
          >
            {logoPreview ? (
              <img src={logoPreview || "/placeholder.svg"} alt="Company logo preview" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
          </button>
          <div>
            <p className="text-sm font-medium text-foreground">Company Logo</p>
            <p className="text-xs text-muted-foreground">PNG or JPG, up to 2MB.</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-1 text-sm font-medium text-primary hover:underline"
            >
              Upload image
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
        </div>

        <Input
          id="company"
          label="Company Name"
          placeholder="Nimbus Inc."
          icon={<Building2 className="h-4 w-4" />}
          required
        />

        <Input
          id="employee"
          label="Employee Name"
          placeholder="Jordan Rivera"
          icon={<User className="h-4 w-4" />}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="jordan@nimbus.co"
            icon={<Mail className="h-4 w-4" />}
            required
          />
          <Input
            id="phone"
            label="Phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            icon={<Phone className="h-4 w-4" />}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id="pass"
            label="Password"
            type="password"
            placeholder="Create password"
            icon={<Lock className="h-4 w-4" />}
            required
          />
          <Input
            id="confirm"
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            icon={<Lock className="h-4 w-4" />}
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          Sign Up
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
