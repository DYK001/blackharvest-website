"use client";
import { RecoveryPage } from "@/components/recovery-page";
export default function Error({ retry }: { retry: () => void }) { return <RecoveryPage retry={retry} />; }
