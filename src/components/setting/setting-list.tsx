import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "next-view-transitions";
import { useTranslations } from "next-intl";
import { capitalize } from "@/lib/utils";
import { siteItems, userItems } from "./items";
import * as motion from "motion/react-client";

export const SettingList: React.FC<{ region?: "personal" | "site" }> = ({
  region,
}) => {
  const t = useTranslations("Private.Setting");

  return (
    <div className="space-y-8">
      {(!region || region === "personal") && (
        <motion.div>
          <Link href="/dash/setting/personal">
            <h2 className="mb-4 font-semibold text-lg">
              {t("Personal.title")}
            </h2>
          </Link>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <Link href={`/dash/setting/personal/${item.id}`}>
                  <Card className="transition-colors duration-200 hover:bg-muted">
                    <CardHeader>
                      <CardTitle>
                        <item.icon className="mr-2 inline h-4 w-4" />
                        {t(`Personal.${capitalize(item.id)}.title`)}
                      </CardTitle>
                      <CardDescription>
                        {t(`Personal.${capitalize(item.id)}.description`)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {(!region || region === "site") && (
        <motion.div>
          <Link href="/dash/setting/site">
            <h2 className="mb-4 font-semibold text-lg">{t("Site.title")}</h2>
          </Link>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {siteItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <Link href={`/dash/setting/site/${item.id}`}>
                  <Card className="transition-colors duration-200 hover:bg-muted">
                    <CardHeader>
                      <CardTitle>
                        <item.icon className="mr-2 inline h-4 w-4" />
                        {t(`Site.${capitalize(item.id)}.title`)}
                      </CardTitle>
                      <CardDescription>
                        {t(`Site.${capitalize(item.id)}.description`)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
