import { Children, isValidElement, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Image,
  Link,
  List,
  Stack,
  Text,
  ListIcon,
  ListItem
} from "@chakra-ui/react";
import ProjectsArray from "./ProjectsArray";
import { ChevronRightIcon } from "@chakra-ui/icons";

const toEmbedUrl = (href) => {
  const youtubeStandardUrlMatch = href.match(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/i);
  const youtuShortUrlMatch = href.match(/https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/i);

  if (youtubeStandardUrlMatch) {
    return `https://www.youtube.com/embed/${youtubeStandardUrlMatch[1]}`;
  }

  if (youtuShortUrlMatch) {
    return `https://www.youtube.com/embed/${youtuShortUrlMatch[1]}`;
  }

  return href;
};

const parseProjectMarkdown = (mdContent) => {
  return mdContent.replace(/<!--[\s\S]*?-->/g, "").trim();
};

const EmbeddedVideo = ({ href, text }) => (
  <Box my={4}>
    <Box
      as="iframe"
      src={toEmbedUrl(href)}
      title={text}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      borderRadius="md"
      width="100%"
      height="320px"
    />
    <Link href={href} isExternal color="brand.400">
      {text}
    </Link>
  </Box>
);

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams(); //for back navigation
  const projects = ProjectsArray();
  const project = projects.find((item) => item.slug === slug);
  const [detail, setDetail] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }

    fetch(`/content/projects/${slug}.md`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }

        return response.text();
      })
      .then((mdContent) => {
        setDetail(parseProjectMarkdown(mdContent));
        setLoadError("");
      })
      .catch(() => {
        setLoadError("Project details are not available yet.");
      });
  }, [slug]);

  const markdownComponents = {
    h1: ({ children }) => (
      <Heading as="h1" size="xl" py={2}>
        {children}
      </Heading>
    ),
    h2: ({ children }) => (
      <Heading as="h2" size="lg" mt={8} mb={4}>
        {children}
      </Heading>
    ),
    h3: ({ children }) => (
      <Heading as="h3" size="md" mt={6} mb={3}>
        {children}
      </Heading>
    ),
    p: ({ children }) => {
      const hasEmbeddedVideo = Children.toArray(children).some(
        (child) => isValidElement(child) && child.type === EmbeddedVideo,
      );

      if (hasEmbeddedVideo) {
        return <Box py={2}>{children}</Box>;
      }

      return (
        <Text as="p" py={2} lineHeight="tall">
          {children}
        </Text>
      );
    },
    ul: ({ children }) => (
      <List spacing={3} pl={6} py={2}>
        {children}
      </List>
    ),
    li: ({ children }) => (
      <ListItem display="flex" alignItems="flex-start" gap={2} lineHeight="tall">
        <ListIcon as={ChevronRightIcon} boxSize={6} color="brand.500" mt={1} />
        <Box flex="1">{children}</Box>
      </ListItem>
    ),
    img: ({ src, alt }) => (
      <Image src={src} alt={alt} borderRadius="lg" my={4} w="100%" />
    ),
    a: ({ href, children }) => {
      const embedUrl = toEmbedUrl(href || "");
      const isYouTubeEmbed = embedUrl !== (href || "");

      if (isYouTubeEmbed) {
        const text = Array.isArray(children)
          ? children.filter((child) => typeof child === "string").join("").trim() || "Watch video"
          : typeof children === "string"
          ? children
          : "Watch video";

        return <EmbeddedVideo href={href} text={text} />;
      }

      return (
        <Link href={href} isExternal color="brand.400">
          {children}
        </Link>
      );
    },
  };

  if (!project && projects.length === 0) {
    return (
      <Container maxW="3xl" pt={24} pb={16}>
        <Text>Loading project details...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="3xl" pt={24} pb={16}>
      <Stack spacing={10}>
        <Button
          alignSelf="flex-start"
          //variant="ghost"
          //colorScheme="brand"
          color="brand.400"
          onClick={() => {
            if (project?.slug) {
              navigate("/", { state: { scrollTo: project.slug } });
            } else if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/", { state: { scrollTo: "projects" } });
            }
          }}
        >
          Back to Projects
        </Button>

        {!project ? (
          <Stack spacing={4}>
            <Heading size="xl" fontFamily="headingCustom">Project not found</Heading>
            <Text>
              This project does not exist yet in the markdown summary list.
            </Text>
          </Stack>
        ) : (
          <>
            <Stack spacing={10}>
              <Heading size="2xl" fontFamily="headingCustom">{project.name}</Heading>
              <Text fontSize="lg" color="gray.500">
                {project.description}
              </Text>
              <HStack flexWrap="wrap" spacing={2}>
                {project.badges.map((badge) => (
                  <Badge key={badge.text} colorScheme={badge.colorScheme}>
                    {badge.text}
                  </Badge>
                ))}
              </HStack>
            </Stack>

            {/* {project.image ? (
              <Image
                src={project.image}
                alt={project.name}
                borderRadius="xl"
                shadow="lg"
              />
            ) : null} */}

            {/* {project.video ? (
              <Box>
                <Box
                  as="iframe"
                  src={project.video.embedUrl}
                  title={project.video.text}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  borderRadius="md"
                  width="100%"
                  height="320px"
                />
              </Box>
            ) : null} */}

            {loadError ? (
              <Text color="gray.500">{loadError}</Text>
            ) : (
              <Box className="project-detail-markdown">
                <ReactMarkdown components={markdownComponents}>
                  {detail}
                </ReactMarkdown>
              </Box>
            )}

            {/* <Stack spacing={3}>
              <Heading size="md">Links</Heading>
              <HStack flexWrap="wrap" spacing={3}>
                {project.buttons.map((button) => (
                  button.href.startsWith("/") ? (
                    <Button key={button.text} color={`${color}.400`} onClick={() => navigate(button.href)}>
                      {button.text}
                    </Button>
                  ) : (
                    <Button key={button.text} as="a" href={button.href} color={`${color}.400`}>
                      {button.text}
                    </Button>
                  )
                ))}
              </HStack>
            </Stack> */}
          </>
        )}
      </Stack>
    </Container>
  );
}