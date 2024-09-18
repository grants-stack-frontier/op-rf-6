import React from "react";
import { Heading } from "@/components/ui/headings";
import { Text } from "@/components/ui/text";
import { ConnectButton } from "@/components/auth/connect-button";

export const DisconnectedState = () => {
  return (
    <div className="max-w-screen-md mx-auto">
      <section className="flex flex-col items-center gap-4">
        <video
          className="max-w-lg w-100"
          width={"100%"}
          height={"auto"}
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="./public/SunnyVote_playOnce_700px_HEVC.mov"
            type="video/quicktime"
          />
          <source src="./SunnyVote_playOnce_700px.webm" type="video/webm" />
        </video>
        <div className="flex flex-col items-center gap-4">
          <div className="uppercase tracking-widest">Vote</div>
          <Heading variant={"h2"}>
            Retro Funding Round 5: OP Stack
          </Heading>
          <Text className="text-center">
            Retroactive Public Goods Funding (Retro Funding) 5 will reward contributors to the OP Stack,
            including core Ethereum infrastructure that supports or underpins the OP Stack, advancements in
            OP Stack research and development, and tooling which supports its accessibility and usability.
          </Text>
          <ConnectButton />
        </div>
      </section>
    </div>
  );
};