using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

// public/icon.svg 와 같은 그림을 PNG 로 그립니다 (홈 화면 아이콘용).
// 좌표·색은 icon.svg 의 512 기준 viewBox 를 그대로 옮긴 것입니다.
// 쓰는 법은 같은 폴더의 README.md 를 보세요.
public static class WoofIcon
{
    static PointF P(float x, float y) { return new PointF(x, y); }

    // 2차 베지에(SVG 의 Q 명령)를 3차로 바꿔 그립니다.
    static void Quad(Graphics g, Pen pen, PointF p0, PointF c, PointF p1)
    {
        PointF c1 = P(p0.X + 2f / 3f * (c.X - p0.X), p0.Y + 2f / 3f * (c.Y - p0.Y));
        PointF c2 = P(p1.X + 2f / 3f * (c.X - p1.X), p1.Y + 2f / 3f * (c.Y - p1.Y));
        g.DrawBezier(pen, p0, c1, c2, p1);
    }

    public static string Make(string dir)
    {
        using (Bitmap bmp = new Bitmap(512, 512))
        {
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.SmoothingMode = SmoothingMode.AntiAlias;

                // 배경 (위 → 아래 그라데이션)
                Rectangle all = new Rectangle(0, 0, 512, 512);
                using (LinearGradientBrush bg = new LinearGradientBrush(
                    all, ColorTranslator.FromHtml("#FFF3E2"), ColorTranslator.FromHtml("#FFD9E8"), 90f))
                {
                    g.FillRectangle(bg, all);
                }

                // 귀
                using (SolidBrush ear = new SolidBrush(ColorTranslator.FromHtml("#8E5526")))
                {
                    g.FillEllipse(ear, 114, 198, 76, 148);
                    g.FillEllipse(ear, 322, 198, 76, 148);
                }

                // 머리
                using (SolidBrush head = new SolidBrush(ColorTranslator.FromHtml("#C9854A")))
                {
                    g.FillEllipse(head, 138, 150, 236, 236);
                }

                // 볼
                Color ch = ColorTranslator.FromHtml("#F9B8C4");
                using (SolidBrush cheek = new SolidBrush(Color.FromArgb(166, ch.R, ch.G, ch.B)))
                {
                    g.FillEllipse(cheek, 144, 290, 52, 36);
                    g.FillEllipse(cheek, 316, 290, 52, 36);
                }

                // 눈 (기쁨 — 위로 휜 선)
                using (Pen eye = new Pen(ColorTranslator.FromHtml("#3C2B22"), 13f))
                {
                    eye.StartCap = LineCap.Round;
                    eye.EndCap = LineCap.Round;
                    g.DrawArc(eye, 196, 239, 40, 26, 180, 180);
                    g.DrawArc(eye, 276, 239, 40, 26, 180, 180);
                }

                // 주둥이 + 코
                using (SolidBrush snout = new SolidBrush(ColorTranslator.FromHtml("#DFA873")))
                {
                    g.FillEllipse(snout, 192, 276, 128, 92);
                }
                using (SolidBrush nose = new SolidBrush(ColorTranslator.FromHtml("#3C2B22")))
                {
                    g.FillEllipse(nose, 233, 283, 46, 34);
                }

                // 입
                using (Pen mouth = new Pen(ColorTranslator.FromHtml("#3C2B22"), 8f))
                {
                    mouth.StartCap = LineCap.Round;
                    mouth.EndCap = LineCap.Round;
                    g.DrawLine(mouth, 256, 317, 256, 333);
                    Quad(g, mouth, P(256, 333), P(236, 351), P(220, 335));
                    Quad(g, mouth, P(256, 333), P(276, 351), P(292, 335));
                }

                // 혀
                using (GraphicsPath path = new GraphicsPath())
                {
                    path.AddBezier(
                        P(242, 352),
                        P(242 + 2f / 3f * 14, 352 + 2f / 3f * 26),
                        P(270 - 2f / 3f * 14, 352 + 2f / 3f * 26),
                        P(270, 352));
                    path.CloseFigure();
                    using (SolidBrush tongue = new SolidBrush(ColorTranslator.FromHtml("#F28BA0")))
                    {
                        g.FillPath(tongue, path);
                    }
                }
            }

            string big = Path.Combine(dir, "icon-512.png");
            bmp.Save(big, ImageFormat.Png);

            using (Bitmap small = new Bitmap(192, 192))
            {
                using (Graphics gs = Graphics.FromImage(small))
                {
                    gs.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    gs.SmoothingMode = SmoothingMode.HighQuality;
                    gs.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    gs.DrawImage(bmp, 0, 0, 192, 192);
                }
                small.Save(Path.Combine(dir, "icon-192.png"), ImageFormat.Png);
            }

            return big;
        }
    }
}
