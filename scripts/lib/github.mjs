// Reads the numbers behind the GitHub cards from the GraphQL API.
// Everything here is what the public profile already shows; nothing is estimated.
// It sticks to figures that are the same for any token. Commit and pull-request
// counts are not: the owner's token also counts private work, the workflow's does not.

const API = "https://api.github.com/graphql";

async function gql(token, query, variables) {
  const res = await fetch(API, {
    method: "POST",
    headers: { authorization: `bearer ${token}`, "content-type": "application/json", "user-agent": "profile-readme-build" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(`GitHub API: ${json.errors.map((e) => e.message).join("; ")}`);
  return json.data;
}

const OVERVIEW = `
query ($login: String!) {
  user(login: $login) {
    createdAt
    followers { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
      totalCount
      nodes { name stargazerCount }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

const YEAR = `
query ($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

/** Longest and current run of days with at least one contribution. */
export function streaks(days) {
  let longest = { days: 0, from: null, to: null };
  let run = { days: 0, from: null, to: null };
  for (const d of days) {
    if (d.count > 0) {
      run = run.days ? { days: run.days + 1, from: run.from, to: d.date } : { days: 1, from: d.date, to: d.date };
      if (run.days > longest.days) longest = run;
    } else {
      run = { days: 0, from: null, to: null };
    }
  }
  // A day that has not seen a commit yet does not break the streak.
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let current = { days: 0, from: null, to: null };
  for (; i >= 0 && days[i].count > 0; i--) {
    current = { days: current.days + 1, from: days[i].date, to: current.to ?? days[i].date };
  }
  return { current, longest };
}

export async function fetchGitHub(login, token) {
  const { user } = await gql(token, OVERVIEW, { login });
  const calendar = user.contributionsCollection.contributionCalendar;
  const weeks = calendar.weeks.map((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] })),
  );
  const today = weeks.at(-1).at(-1).date;

  // Every year since the account was opened, for all-time totals and streaks.
  const firstYear = new Date(user.createdAt).getUTCFullYear();
  const lastYear = Number(today.slice(0, 4));
  const years = await Promise.all(
    Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i).map((y) =>
      gql(token, YEAR, { login, from: `${y}-01-01T00:00:00Z`, to: `${y}-12-31T23:59:59Z` }),
    ),
  );
  const byDate = new Map();
  let allTime = 0;
  for (const y of years) {
    const cal = y.user.contributionsCollection.contributionCalendar;
    allTime += cal.totalContributions;
    for (const w of cal.weeks) for (const d of w.contributionDays) byDate.set(d.date, d.contributionCount);
  }
  const days = [...byDate]
    .filter(([date]) => date <= today)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, count]) => ({ date, count }));

  const repos = Object.fromEntries(user.repositories.nodes.map((r) => [r.name, { stars: r.stargazerCount }]));
  return {
    login,
    today,
    since: firstYear,
    weeks,
    lastYear: calendar.totalContributions,
    allTime,
    publicRepos: user.repositories.totalCount,
    stars: user.repositories.nodes.reduce((sum, r) => sum + r.stargazerCount, 0),
    followers: user.followers.totalCount,
    last30: days.slice(-30),
    ...streaks(days),
    repos,
  };
}

/** The newest posts from an RSS feed: [{ title, link, date, description }]. */
export async function fetchFeed(url, limit = 3) {
  const res = await fetch(url, { headers: { "user-agent": "profile-readme-build" } });
  if (!res.ok) throw new Error(`Feed responded ${res.status}`);
  const xml = await res.text();
  const pick = (block, tag) => {
    const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
    return m ? m[1].trim() : "";
  };
  const unescape = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, limit).map(([, item]) => ({
    title: unescape(pick(item, "title")),
    link: unescape(pick(item, "link")),
    date: new Date(pick(item, "pubDate")).toISOString().slice(0, 10),
    description: unescape(pick(item, "description")),
  }));
}
