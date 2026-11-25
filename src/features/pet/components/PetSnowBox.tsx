"use client";

import { useTranslations } from "use-intl";
import { Button } from "@/components/ui";
import { FURNITURE, isSeasonal } from "../furniture";
import { SNOW_EACH } from "../profile";
import { SnowflakeIcon } from "./PetIcons";
import { BoxWelcome, DailyBoxDialog } from "./PetGiftBox";

/** The Christmas pieces, in catalog order, for the first box's note. */
const CHRISTMAS = FURNITURE.map((piece) => piece.id).filter(isSeasonal);

/**
 * The day's snow box (I-074, November to February): a snowflake for the
 * Christmas pieces. The very first one says what snowflakes make.
 */
export function PetSnowBox({
  first,
  step,
  onClose,
  onReceive,
}: {
  first: boolean;
  step?: string;
  onClose: () => void;
  onReceive: () => void;
}) {
  const t = useTranslations("pet.snow");
  const item = useTranslations("pet.items");
  return (
    <DailyBoxDialog
      title={t("title")}
      step={step}
      welcome={
        first && (
          <BoxWelcome
            theme="christmas"
            title={t("welcome.title")}
            pieces={CHRISTMAS}
            text={t("welcome.text")}
          />
        )
      }
      kind="snow"
      lead={t("lead", { count: SNOW_EACH })}
      cells={[
        {
          id: "snow",
          icon: <SnowflakeIcon size={30} />,
          name: item("snow.name"),
          add: SNOW_EACH,
        },
      ]}
      onClose={onClose}
    >
      <Button onClick={onReceive}>{t("take")}</Button>
    </DailyBoxDialog>
  );
}
