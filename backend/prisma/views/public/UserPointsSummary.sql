SELECT
  u.id AS user_id,
  u.full_name,
  u.email,
  c.name AS company_name,
  count(up.id) AS total_points,
  count(
    CASE
      WHEN (up.created_at >= date_trunc('week' :: text, NOW())) THEN 1
      ELSE NULL :: integer
    END
  ) AS weekly_points,
  count(
    CASE
      WHEN (
        up.created_at >= date_trunc('month' :: text, NOW())
      ) THEN 1
      ELSE NULL :: integer
    END
  ) AS monthly_points,
  count(
    CASE
      WHEN (up.created_at >= date_trunc('year' :: text, NOW())) THEN 1
      ELSE NULL :: integer
    END
  ) AS yearly_points
FROM
  (
    (
      users u
      LEFT JOIN companies c ON ((u.company_id = c.id))
    )
    LEFT JOIN user_points up ON ((u.id = up.user_id))
  )
WHERE
  (u.deleted_at IS NULL)
GROUP BY
  u.id,
  u.full_name,
  u.email,
  c.name;